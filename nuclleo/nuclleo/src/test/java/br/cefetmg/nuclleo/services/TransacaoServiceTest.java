package br.cefetmg.nuclleo.services;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.cefetmg.nuclleo.Fixtures;
import br.cefetmg.nuclleo.exception.ForbiddenException;
import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.Transacao;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.TransacaoRepository;
import br.cefetmg.nuclleo.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class TransacaoServiceTest {

    @Mock
    private TransacaoRepository transacaoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private AnuncioService anuncioService;

    @InjectMocks
    private TransacaoService transacaoService;

    private final Usuario vendedor = Fixtures.usuario(1, "vendedor@gmail.com");
    private final Usuario comprador = Fixtures.usuario(2, "comprador@gmail.com");
    private final Usuario estranho = Fixtures.usuario(3, "estranho@gmail.com");
    private final Anuncio anuncio = Fixtures.anuncio(10, vendedor);
    private Transacao transacao;

    @BeforeEach
    void montar() {
        transacao = new Transacao();
        transacao.setId(100L);
        transacao.setUsuario(comprador);
        transacao.setAnuncio(anuncio);
    }

    private void logado(Usuario usuario) {
        when(usuarioRepository.findByEmail(usuario.getEmail())).thenReturn(Optional.of(usuario));
    }

    @Test
    void compradorEVendedorVeemATransacao() {
        when(transacaoRepository.findById(100L)).thenReturn(Optional.of(transacao));
        logado(comprador);
        logado(vendedor);

        assertSame(transacao, transacaoService.buscarPorId(100L, comprador.getEmail()));
        assertSame(transacao, transacaoService.buscarPorId(100L, vendedor.getEmail()));
    }

    @Test
    void quemNaoParticipouNaoVeATransacao() {
        when(transacaoRepository.findById(100L)).thenReturn(Optional.of(transacao));
        logado(estranho);

        assertThrows(ForbiddenException.class, () -> transacaoService.buscarPorId(100L, estranho.getEmail()));
    }

    @Test
    void ninguemListaAsTransacoesDeOutroUsuario() {
        logado(estranho);

        assertThrows(ForbiddenException.class,
                () -> transacaoService.listarPorUsuarioEnvolvido(comprador.getCdUsuario(), estranho.getEmail()));
        verify(transacaoRepository, never())
                .findByUsuarioCdUsuarioOrAnuncioUsuarioCriaCdUsuarioOrderByDataDesc(anyLong(), anyLong());
    }

    @Test
    void usuarioListaAsPropriasTransacoes() {
        logado(comprador);
        when(transacaoRepository.findByUsuarioCdUsuarioOrAnuncioUsuarioCriaCdUsuarioOrderByDataDesc(2L, 2L))
                .thenReturn(List.of(transacao));

        assertSame(transacao, transacaoService.listarPorUsuarioEnvolvido(2L, comprador.getEmail()).get(0));
    }

    @Test
    void soODonoDoAnuncioListaAsTransacoesDele() {
        when(anuncioService.buscarPorId(10L)).thenReturn(anuncio);
        logado(comprador);

        assertThrows(ForbiddenException.class, () -> transacaoService.listarPorAnuncio(10L, comprador.getEmail()));
    }
}
