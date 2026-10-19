package br.cefetmg.nuclleo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
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

import br.cefetmg.nuclleo.Fixtures;
import br.cefetmg.nuclleo.dto.MensagemRequestDTO;
import br.cefetmg.nuclleo.exception.BusinessException;
import br.cefetmg.nuclleo.exception.ForbiddenException;
import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.Interesse;
import br.cefetmg.nuclleo.model.Mensagem;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.InteresseRepository;
import br.cefetmg.nuclleo.repository.MensagemRepository;

@ExtendWith(MockitoExtension.class)
class MensagemServiceTest {

    @Mock
    private MensagemRepository mensagemRepository;
    @Mock
    private InteresseService interesseService;
    @Mock
    private InteresseRepository interesseRepository;
    @Mock
    private UsuarioService usuarioService;

    @InjectMocks
    private MensagemService mensagemService;

    private final Usuario anunciante = Fixtures.usuario(1, "anunciante@gmail.com");
    private final Usuario interessado = Fixtures.usuario(2, "interessado@gmail.com");
    private final Usuario estranho = Fixtures.usuario(3, "estranho@gmail.com");
    private Interesse interesse;

    @BeforeEach
    void montar() {
        Anuncio anuncio = Fixtures.anuncio(10, anunciante);
        interesse = Fixtures.interesse(5, interessado, anuncio);
    }

    private MensagemRequestDTO texto(String conteudo) {
        MensagemRequestDTO dto = new MensagemRequestDTO();
        dto.setConteudo(conteudo);
        return dto;
    }

    @Test
    void participanteEnviaMensagem() {
        when(interesseService.buscarPorId(5L)).thenReturn(interesse);
        when(usuarioService.buscarPorId(2L)).thenReturn(interessado);
        when(mensagemRepository.save(any(Mensagem.class))).thenAnswer(i -> i.getArgument(0));

        assertEquals(2L, mensagemService.salvar(5L, 2L, texto("oi")).getCdUsuarioRemetente());
    }

    @Test
    void quemNaoParticipaNaoEnvia() {
        when(interesseService.buscarPorId(5L)).thenReturn(interesse);
        when(usuarioService.buscarPorId(3L)).thenReturn(estranho);

        assertThrows(BusinessException.class, () -> mensagemService.salvar(5L, 3L, texto("oi")));
        verify(mensagemRepository, never()).save(any());
    }

    @Test
    void antesDoAceiteSoOInteressadoEscreveEComLimite() {
        interesse.setAceito(false);
        when(interesseService.buscarPorId(5L)).thenReturn(interesse);
        when(usuarioService.buscarPorId(1L)).thenReturn(anunciante);
        when(usuarioService.buscarPorId(2L)).thenReturn(interessado);
        when(mensagemRepository.countByInteresseId(5L)).thenReturn((long) MensagemService.LIMITE_MENSAGENS_PENDENTES);

        assertThrows(BusinessException.class, () -> mensagemService.salvar(5L, 1L, texto("oi")));
        assertThrows(BusinessException.class, () -> mensagemService.salvar(5L, 2L, texto("oi")));
    }

    @Test
    void historicoSoParaParticipantes() {
        when(usuarioService.buscarPorEmail("estranho@gmail.com")).thenReturn(estranho);
        when(interesseRepository.participaDaConversa(5L, 3L)).thenReturn(false);

        assertThrows(ForbiddenException.class,
                () -> mensagemService.listarPorInteresse(5L, "estranho@gmail.com", null, 50));
    }
}
