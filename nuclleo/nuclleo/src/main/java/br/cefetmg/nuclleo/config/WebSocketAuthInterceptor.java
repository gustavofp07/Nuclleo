package br.cefetmg.nuclleo.config;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import br.cefetmg.nuclleo.repository.UsuarioRepository;
import br.cefetmg.nuclleo.security.JwtService;

/**
 * Identifica quem abriu a conexão do WebSocket.
 *
 * O token é validado UMA vez, no CONNECT. Se for válido (e a conta estiver ativa),
 * os dados do usuário ficam guardados na própria sessão do WebSocket e as mensagens
 * seguintes usam esses dados, sem validar token nem consultar o banco de novo.
 *
 * Conexões sem token continuam aceitas (chat privado e notificações ainda não mandam
 * token); só os recursos que exigem login, como o "digitando" da comunidade, as ignoram.
 */
@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    public static final String ATRIBUTO_CD_USUARIO = "cdUsuario";
    public static final String ATRIBUTO_NM_USUARIO = "nmUsuario";
    public static final String ATRIBUTO_FT_USUARIO = "ftUsuario";

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null || accessor.getCommand() != StompCommand.CONNECT) {
            return message;
        }

        Map<String, Object> sessao = accessor.getSessionAttributes();
        String cabecalho = accessor.getFirstNativeHeader("Authorization");

        if (sessao == null || cabecalho == null || !cabecalho.startsWith("Bearer ")) {
            return message;
        }

        String token = cabecalho.substring(7);

        try {
            if (!jwtService.validarToken(token)) {
                return message;
            }

            usuarioRepository.findByEmail(jwtService.getEmail(token))
                    .filter(usuario -> usuario.isAtivo())
                    .ifPresent(usuario -> {
                        sessao.put(ATRIBUTO_CD_USUARIO, usuario.getCdUsuario());
                        sessao.put(ATRIBUTO_NM_USUARIO, usuario.getNmUsuario());
                        if (usuario.getFtUsuario() != null) {
                            sessao.put(ATRIBUTO_FT_USUARIO, usuario.getFtUsuario());
                        }
                    });
        } catch (Exception e) {
            // Token inválido: a conexão segue anônima
        }

        return message;
    }
}
