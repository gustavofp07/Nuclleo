package br.cefetmg.nuclleo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

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
import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.Anuncio.TipoAnuncio;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.AnuncioComunidadeRepository;
import br.cefetmg.nuclleo.repository.AnuncioRepository;
import br.cefetmg.nuclleo.repository.InteresseRepository;

@ExtendWith(MockitoExtension.class)
class AnuncioComunidadeServiceTest {

    @Mock
    private AnuncioComunidadeRepository repository;

    @Mock
    private AnuncioRepository anuncioRepository;

    @Mock
    private InteresseRepository interesseRepository;

    @InjectMocks
    private AnuncioComunidadeService service;

    private final Pageable pagina = PageRequest.of(0, 20);
    private final Usuario dono = Fixtures.usuario(1, "dono@gmail.com");
    private final Anuncio bicicleta = Fixtures.anuncio(10, dono);
    private final Anuncio geladeira = Fixtures.anuncio(11, dono);

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
