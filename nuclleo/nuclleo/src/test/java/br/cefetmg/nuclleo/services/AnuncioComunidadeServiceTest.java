package br.cefetmg.nuclleo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import br.cefetmg.nuclleo.Fixtures;
import br.cefetmg.nuclleo.dto.TotalInteressadosDTO;
import br.cefetmg.nuclleo.exception.BadRequestException;
import br.cefetmg.nuclleo.exception.ForbiddenException;
import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.Anuncio.TipoAnuncio;
import br.cefetmg.nuclleo.model.AnuncioComunidade;
import br.cefetmg.nuclleo.model.Comunidade;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.AnuncioComunidadeRepository;
import br.cefetmg.nuclleo.repository.AnuncioRepository;
import br.cefetmg.nuclleo.repository.ComunidadeRepository;
import br.cefetmg.nuclleo.repository.InteresseRepository;
import br.cefetmg.nuclleo.repository.UsuarioComunidadeRepository;
import br.cefetmg.nuclleo.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class AnuncioComunidadeServiceTest {

    @Mock
    private AnuncioComunidadeRepository repository;

    @Mock
    private AnuncioRepository anuncioRepository;

    @Mock
    private InteresseRepository interesseRepository;

    @Mock
    private ComunidadeRepository comunidadeRepository;

    @Mock
    private UsuarioComunidadeRepository usuarioComunidadeRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private AnuncioComunidadeService service;

    private final Pageable pagina = PageRequest.of(0, 20);
    private final Usuario dono = Fixtures.usuario(1, "dono@gmail.com");
    private final Anuncio bicicleta = Fixtures.anuncio(10, dono);
    private final Anuncio geladeira = Fixtures.anuncio(11, dono);
    private final Usuario criadorDaComunidade = Fixtures.usuario(2, "criador@gmail.com");
    private final Usuario estranho = Fixtures.usuario(3, "estranho@gmail.com");

    private Comunidade comunidade() {
        Comunidade comunidade = new Comunidade();
        comunidade.setCdComunidade(5L);
        comunidade.setUsuarioCria(criadorDaComunidade);
        return comunidade;
    }

    // Como chega do front: só os códigos valem
    private AnuncioComunidade pedido() {
        Anuncio anuncio = Fixtures.anuncio(10, estranho);
        AnuncioComunidade relacao = new AnuncioComunidade();
        relacao.setAnuncio(anuncio);
        relacao.setComunidade(comunidade());
        return relacao;
    }

    private void publicando(Usuario solicitante, Comunidade comunidade) {
        when(usuarioRepository.findByEmail(solicitante.getEmail())).thenReturn(Optional.of(solicitante));
        when(anuncioRepository.findById(10L)).thenReturn(Optional.of(bicicleta));
        when(comunidadeRepository.findById(5L)).thenReturn(Optional.of(comunidade));
    }

    @Test
    void membroPublicaOProprioAnuncioUsandoOsDadosDoBanco() {
        publicando(dono, comunidade());
        when(usuarioComunidadeRepository.existsByUsuarioCdUsuarioAndComunidadeCdComunidade(1L, 5L)).thenReturn(true);
        when(repository.saveAll(any())).thenAnswer(i -> i.getArgument(0));

        AnuncioComunidade salva = service.inserirRelacoes(List.of(pedido()), dono.getEmail()).get(0);

        assertSame(bicicleta, salva.getAnuncio());
    }

    @Test
    void naoPublicaEmComunidadeDeQueNaoParticipa() {
        publicando(dono, comunidade());
        when(usuarioComunidadeRepository.existsByUsuarioCdUsuarioAndComunidadeCdComunidade(1L, 5L)).thenReturn(false);

        assertThrows(ForbiddenException.class, () -> service.inserirRelacoes(List.of(pedido()), dono.getEmail()));
        verify(repository, never()).saveAll(any());
    }

    @Test
    void oDonoDaComunidadePublicaMesmoSemVinculoDeMembro() {
        Comunidade dele = comunidade();
        dele.setUsuarioCria(dono);
        publicando(dono, dele);
        when(repository.saveAll(any())).thenAnswer(i -> i.getArgument(0));

        assertEquals(1, service.inserirRelacoes(List.of(pedido()), dono.getEmail()).size());
    }

    @Test
    void naoPublicaAnuncioDeOutraPessoa() {
        publicando(estranho, comunidade());

        assertThrows(ForbiddenException.class, () -> service.inserirRelacoes(List.of(pedido()), estranho.getEmail()));
        verify(repository, never()).saveAll(any());
    }

    @Test
    void relacaoSemAnuncioOuComunidadeEInvalida() {
        when(usuarioRepository.findByEmail(dono.getEmail())).thenReturn(Optional.of(dono));

        assertThrows(BadRequestException.class,
                () -> service.inserirRelacoes(List.of(new AnuncioComunidade()), dono.getEmail()));
    }

    @Test
    void soODonoDoAnuncioRemoveTodasAsPublicacoesDele() {
        when(anuncioRepository.findById(10L)).thenReturn(Optional.of(bicicleta));

        assertThrows(ForbiddenException.class, () -> service.excluirPorAnuncio(10L, estranho.getEmail()));
        verify(repository, never()).deleteByAnuncioCdAnuncio(any());

        service.excluirPorAnuncio(10L, dono.getEmail());
        verify(repository).deleteByAnuncioCdAnuncio(10L);
    }

    @Test
    void soODonoDaComunidadeRemoveTodosOsAnunciosDela() {
        when(comunidadeRepository.findById(5L)).thenReturn(Optional.of(comunidade()));

        assertThrows(ForbiddenException.class, () -> service.excluirPorComunidade(5L, estranho.getEmail()));
        verify(repository, never()).deleteByComunidadeCdComunidade(any());
    }

    @Test
    void relacaoSaiPeloDonoDoAnuncioOuDaComunidade() {
        when(anuncioRepository.findById(10L)).thenReturn(Optional.of(bicicleta));
        when(comunidadeRepository.findById(5L)).thenReturn(Optional.of(comunidade()));

        service.excluirRelacaoEspecifica(10L, 5L, dono.getEmail());
        service.excluirRelacaoEspecifica(10L, 5L, criadorDaComunidade.getEmail());
        verify(repository, times(2)).deleteByAnuncioCdAnuncioAndComunidadeCdComunidade(10L, 5L);

        assertThrows(ForbiddenException.class, () -> service.excluirRelacaoEspecifica(10L, 5L, estranho.getEmail()));
    }

    @Test
    void semFiltroBuscaTodosOsTiposETextos() {
        when(repository.findAnunciosByComunidade(5L, List.of(TipoAnuncio.values()), "%%", pagina))
                .thenReturn(Page.empty());

        assertTrue(service.listarAnunciosDaComunidade(5L, null, null, pagina).isEmpty());
        verify(interesseRepository, never()).contarInteressados(any());
    }

    @Test
    void filtraPorTipoEBuscaSemDiferenciarMaiusculas() {
        when(repository.findAnunciosByComunidade(5L, List.of(TipoAnuncio.REQUERIMENTO), "%bicicleta%", pagina))
                .thenReturn(Page.empty());

        assertTrue(service.listarAnunciosDaComunidade(5L, "  BiCiCleta ", TipoAnuncio.REQUERIMENTO, pagina).isEmpty());
    }

    @Test
    void curingasDoLikeDigitadosSaoTextoComum() {
        when(repository.findAnunciosByComunidade(eq(5L), any(), anyString(), eq(pagina))).thenReturn(Page.empty());

        service.listarAnunciosDaComunidade(5L, "100%_!", null, pagina);

        verify(repository).findAnunciosByComunidade(eq(5L), any(), eq("%100!%!_!!%"), eq(pagina));
    }

    @Test
    void cadaAnuncioDaListaVemComOTotalDeInteressados() {
        when(repository.findAnunciosByComunidade(eq(5L), any(), anyString(), eq(pagina)))
                .thenReturn(new PageImpl<>(List.of(bicicleta, geladeira)));
        when(interesseRepository.contarInteressados(List.of(10L, 11L)))
                .thenReturn(List.of(new TotalInteressadosDTO(10L, 3L)));

        service.listarAnunciosDaComunidade(5L, null, null, pagina);

        assertEquals(3L, bicicleta.getTotalInteressados());
        assertEquals(0L, geladeira.getTotalInteressados());
    }

    @Test
    void popularesMantemAOrdemDoRanking() {
        when(interesseRepository.rankingDaComunidade(5L, PageRequest.of(0, 5))).thenReturn(List.of(
                new TotalInteressadosDTO(11L, 7L),
                new TotalInteressadosDTO(10L, 2L)));
        // o banco devolve por id, sem respeitar a ordem do ranking
        when(anuncioRepository.findAllById(List.of(11L, 10L))).thenReturn(List.of(bicicleta, geladeira));

        List<Anuncio> populares = service.listarPopularesDaComunidade(5L, 5);

        assertEquals(List.of(geladeira, bicicleta), populares);
        assertEquals(7L, geladeira.getTotalInteressados());
    }
}
