package br.cefetmg.nuclleo.services;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import br.cefetmg.nuclleo.Fixtures;
import br.cefetmg.nuclleo.dto.InteresseRequestDTO;
import br.cefetmg.nuclleo.exception.ConflictException;
import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.Interesse;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.InteresseRepository;

@ExtendWith(MockitoExtension.class)
class InteresseServiceTest {

    @Mock
    private InteresseRepository interesseRepository;

    @Mock
    private UsuarioService usuarioService;

    @Mock
    private AnuncioService anuncioService;

    @InjectMocks
    private InteresseService interesseService;

    private final Usuario dono = Fixtures.usuario(1, "dono@gmail.com");
    private final Usuario interessado = Fixtures.usuario(2, "interessado@gmail.com");
    private final Anuncio anuncio = Fixtures.anuncio(10, dono);
    private final InteresseRequestDTO dto = new InteresseRequestDTO();

    @BeforeEach
    void montar() {
        ReflectionTestUtils.setField(dto, "cdUsuario", 2L);
        ReflectionTestUtils.setField(dto, "cdAnuncio", 10L);
        when(usuarioService.buscarPorId(2L)).thenReturn(interessado);
        when(anuncioService.buscarPorId(10L)).thenReturn(anuncio);
    }

    @Test
    void registraOPrimeiroInteresse() {
        when(interesseRepository.existsByUsuarioCdUsuarioAndAnuncioCdAnuncio(2L, 10L)).thenReturn(false);
        Interesse salvo = new Interesse();
        when(interesseRepository.save(any(Interesse.class))).thenReturn(salvo);

        assertSame(salvo, interesseService.inserir(dto));
    }

    @Test
    void naoRegistraOMesmoInteresseDuasVezes() {
        when(interesseRepository.existsByUsuarioCdUsuarioAndAnuncioCdAnuncio(2L, 10L)).thenReturn(true);

        assertThrows(ConflictException.class, () -> interesseService.inserir(dto));
        verify(interesseRepository, never()).save(any());
    }
}
