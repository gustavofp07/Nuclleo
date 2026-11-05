package br.cefetmg.nuclleo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.cefetmg.nuclleo.Fixtures;
import br.cefetmg.nuclleo.exception.BusinessException;
import br.cefetmg.nuclleo.exception.ForbiddenException;
import br.cefetmg.nuclleo.exception.ResourceNotFoundException;
import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.Status;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.AnuncioComunidadeRepository;
import br.cefetmg.nuclleo.repository.AnuncioRepository;
import br.cefetmg.nuclleo.repository.InteresseRepository;
import br.cefetmg.nuclleo.repository.MensagemRepository;

@ExtendWith(MockitoExtension.class)
class ModeracaoServiceTest {

    @Mock
    private AnuncioRepository anuncioRepository;

    @Mock
    private InteresseRepository interesseRepository;

    @Mock
    private MensagemRepository mensagemRepository;

    @Mock
    private AnuncioComunidadeRepository anuncioComunidadeRepository;

    @InjectMocks
    private ModeracaoService moderacaoService;

    private final Usuario dono = Fixtures.usuario(1, "dono@gmail.com");
    private final Anuncio anuncio = Fixtures.anuncio(10, dono);

    @BeforeEach
    void montar() {
        when(anuncioRepository.findById(10L)).thenReturn(Optional.of(anuncio));
    }

    private void salvarDevolveOAnuncio() {
        when(anuncioRepository.save(anuncio)).thenReturn(anuncio);
    }

    @Test
    void desativarNaoApagaInteressesNemConversas() {
        salvarDevolveOAnuncio();

        moderacaoService.desativarAnuncioPeloDono(10L, dono.getEmail());

        assertEquals(Status.INATIVO, anuncio.getStatus());
        verifyNoInteractions(interesseRepository, mensagemRepository, anuncioComunidadeRepository);
    }

    @Test
    void reativarDevolveOAnuncioAoAr() {
        anuncio.setStatus(Status.INATIVO);
        salvarDevolveOAnuncio();

        moderacaoService.reativarAnuncioPeloDono(10L, dono.getEmail());

        assertEquals(Status.ATIVO, anuncio.getStatus());
    }

    @Test
    void soODonoDesativaOuReativa() {
        assertThrows(ForbiddenException.class,
                () -> moderacaoService.desativarAnuncioPeloDono(10L, "outro@gmail.com"));
        assertThrows(ForbiddenException.class,
                () -> moderacaoService.reativarAnuncioPeloDono(10L, "outro@gmail.com"));
        verify(anuncioRepository, never()).save(any());
    }

    @Test
    void oDonoNaoTiraASuspensaoReativando() {
        anuncio.setStatus(Status.SUSPENSO);

        assertThrows(BusinessException.class, () -> moderacaoService.reativarAnuncioPeloDono(10L, dono.getEmail()));
        assertThrows(BusinessException.class, () -> moderacaoService.desativarAnuncioPeloDono(10L, dono.getEmail()));
        assertEquals(Status.SUSPENSO, anuncio.getStatus());
    }

    @Test
    void anuncioExcluidoNaoVoltaMais() {
        anuncio.setStatus(Status.EXCLUIDO);

        assertThrows(ResourceNotFoundException.class,
                () -> moderacaoService.reativarAnuncioPeloDono(10L, dono.getEmail()));
    }
}
