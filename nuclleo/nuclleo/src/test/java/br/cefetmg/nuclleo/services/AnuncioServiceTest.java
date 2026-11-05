package br.cefetmg.nuclleo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.cefetmg.nuclleo.Fixtures;
import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.Status;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.AnuncioComunidadeRepository;
import br.cefetmg.nuclleo.repository.AnuncioRepository;

@ExtendWith(MockitoExtension.class)
class AnuncioServiceTest {

    @Mock
    private AnuncioRepository anuncioRepository;

    @Mock
    private AnuncioComunidadeRepository anuncioComunidadeRepository;

    @InjectMocks
    private AnuncioService anuncioService;

    private final Usuario dono = Fixtures.usuario(1, "dono@gmail.com");
    private final Anuncio publicado = Fixtures.anuncio(10, dono);
    private final Anuncio semComunidade = Fixtures.anuncio(11, dono);
    private final Anuncio desativado = Fixtures.anuncio(12, dono);

    private void anunciosDoDono() {
        desativado.setStatus(Status.INATIVO);
        when(anuncioRepository.findByUsuarioCria_CdUsuarioAndStatusNot(1L, Status.EXCLUIDO))
                .thenReturn(List.of(publicado, semComunidade, desativado));
    }

    @Test
    void noPerfilSoApareceAnuncioAtivoPublicadoEmComunidade() {
        anunciosDoDono();
        when(anuncioComunidadeRepository.findCdAnunciosPublicadosDoUsuario(1L)).thenReturn(List.of(10L, 12L));

        assertEquals(List.of(publicado), anuncioService.listarAnunciosPorUsuario(1L, "visitante@gmail.com"));
    }

    @Test
    void oDonoContinuaVendoTodosOsSeusAnuncios() {
        anunciosDoDono();

        assertEquals(List.of(publicado, semComunidade, desativado),
                anuncioService.listarAnunciosPorUsuario(1L, dono.getEmail()));
    }
}
