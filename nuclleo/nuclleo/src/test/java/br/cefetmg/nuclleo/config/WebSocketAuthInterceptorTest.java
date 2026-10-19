package br.cefetmg.nuclleo.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;

import br.cefetmg.nuclleo.Fixtures;
import br.cefetmg.nuclleo.model.Perfil;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.ComunidadeRepository;
import br.cefetmg.nuclleo.repository.InteresseRepository;
import br.cefetmg.nuclleo.repository.UsuarioComunidadeRepository;
import br.cefetmg.nuclleo.repository.UsuarioRepository;
import br.cefetmg.nuclleo.security.JwtService;

@ExtendWith(MockitoExtension.class)
class WebSocketAuthInterceptorTest {

    @Mock
    private JwtService jwtService;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private InteresseRepository interesseRepository;
    @Mock
    private ComunidadeRepository comunidadeRepository;
    @Mock
    private UsuarioComunidadeRepository usuarioComunidadeRepository;

    @InjectMocks
    private WebSocketAuthInterceptor interceptor;

    private final MessageChannel canal = mock(MessageChannel.class);

    private Message<byte[]> frame(StompCommand comando, Map<String, Object> sessao, String destino, String token) {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(comando);
        accessor.setSessionAttributes(sessao);
        if (destino != null) {
            accessor.setDestination(destino);
        }
        if (token != null) {
            accessor.addNativeHeader("Authorization", "Bearer " + token);
        }
        accessor.setLeaveMutable(true);
        return MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
    }

    private Map<String, Object> sessaoDe(long cdUsuario, Perfil perfil) {
        Map<String, Object> sessao = new HashMap<>();
        sessao.put(WebSocketAuthInterceptor.ATRIBUTO_CD_USUARIO, cdUsuario);
        sessao.put(WebSocketAuthInterceptor.ATRIBUTO_PERFIL, perfil);
        return sessao;
    }

    private boolean aceita(StompCommand comando, Map<String, Object> sessao, String destino) {
        return interceptor.preSend(frame(comando, sessao, destino, null), canal) != null;
    }

    @Test
    void conexaoSemTokenERecusada() {
        assertThrows(MessagingException.class,
                () -> interceptor.preSend(frame(StompCommand.CONNECT, new HashMap<>(), null, null), canal));
    }

    @Test
    void conexaoComTokenValidoGuardaOUsuarioNaSessao() {
        Usuario ana = Fixtures.usuario(7, "ana@gmail.com");
        when(jwtService.validarToken("abc")).thenReturn(true);
        when(jwtService.getEmail("abc")).thenReturn("ana@gmail.com");
        when(usuarioRepository.findByEmail("ana@gmail.com")).thenReturn(Optional.of(ana));

        Map<String, Object> sessao = new HashMap<>();
        assertNotNull(interceptor.preSend(frame(StompCommand.CONNECT, sessao, null, "abc"), canal));
        assertEquals(7L, sessao.get(WebSocketAuthInterceptor.ATRIBUTO_CD_USUARIO));
    }

    @Test
    void conexaoSemLoginNaoSeInscreveEmNada() {
        assertNull(interceptor.preSend(
                frame(StompCommand.SUBSCRIBE, new HashMap<>(), "/topic/notificacoes/1", null), canal));
    }

    @Test
    void notificacoesSoDoProprioUsuario() {
        Map<String, Object> sessao = sessaoDe(1, Perfil.USUARIO);
        assertEquals(true, aceita(StompCommand.SUBSCRIBE, sessao, "/topic/notificacoes/1"));
        assertEquals(false, aceita(StompCommand.SUBSCRIBE, sessao, "/topic/notificacoes/2"));
    }

    @Test
    void canalDeDenunciasSoParaAdmin() {
        assertEquals(false, aceita(StompCommand.SUBSCRIBE, sessaoDe(1, Perfil.USUARIO), "/topic/admin/denuncias"));
        assertEquals(true, aceita(StompCommand.SUBSCRIBE, sessaoDe(1, Perfil.ADMINISTRADOR), "/topic/admin/denuncias"));
    }

    @Test
    void chatPrivadoSoParaParticipantesEAPermissaoFicaGuardadaNaSessao() {
        when(interesseRepository.participaDaConversa(5L, 1L)).thenReturn(true);
        when(interesseRepository.participaDaConversa(5L, 2L)).thenReturn(false);

        Map<String, Object> participante = sessaoDe(1, Perfil.USUARIO);
        assertEquals(true, aceita(StompCommand.SUBSCRIBE, participante, "/topic/chat/5"));
        assertEquals(true, aceita(StompCommand.SUBSCRIBE, participante, "/topic/chat/5/digitando"));
        assertEquals(true, aceita(StompCommand.SEND, participante, "/app/chat/5"));
        verify(interesseRepository, times(1)).participaDaConversa(5L, 1L);

        Map<String, Object> intruso = sessaoDe(2, Perfil.USUARIO);
        assertEquals(false, aceita(StompCommand.SUBSCRIBE, intruso, "/topic/chat/5"));
        assertEquals(false, aceita(StompCommand.SEND, intruso, "/app/chat/5"));
    }

    @Test
    void chatDaComunidadeSoParaMembrosOuCriador() {
        when(usuarioComunidadeRepository.existsByUsuarioCdUsuarioAndComunidadeCdComunidade(1L, 9L)).thenReturn(false);
        when(comunidadeRepository.existsByCdComunidadeAndUsuarioCria_CdUsuario(9L, 1L)).thenReturn(true);
        when(usuarioComunidadeRepository.existsByUsuarioCdUsuarioAndComunidadeCdComunidade(2L, 9L)).thenReturn(false);
        when(comunidadeRepository.existsByCdComunidadeAndUsuarioCria_CdUsuario(9L, 2L)).thenReturn(false);

        assertEquals(true, aceita(StompCommand.SUBSCRIBE, sessaoDe(1, Perfil.USUARIO), "/topic/comunidade/9"));
        assertEquals(false, aceita(StompCommand.SUBSCRIBE, sessaoDe(2, Perfil.USUARIO), "/topic/comunidade/9"));
    }

    @Test
    void canalDesconhecidoERecusado() {
        assertEquals(false, aceita(StompCommand.SUBSCRIBE, sessaoDe(1, Perfil.ADMINISTRADOR), "/topic/qualquer-coisa"));
    }
}
