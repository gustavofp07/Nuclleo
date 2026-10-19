package br.cefetmg.nuclleo.config;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import br.cefetmg.nuclleo.model.Perfil;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.ComunidadeRepository;
import br.cefetmg.nuclleo.repository.InteresseRepository;
import br.cefetmg.nuclleo.repository.UsuarioComunidadeRepository;
import br.cefetmg.nuclleo.repository.UsuarioRepository;
import br.cefetmg.nuclleo.security.JwtService;

/**
 * Segurança do WebSocket.
 *
 * CONNECT: exige um token válido de uma conta ativa. Os dados do usuário ficam
 * guardados na sessão do WebSocket, e o resto da conexão usa esses dados.
 *
 * SUBSCRIBE e SEND: cada canal só aceita quem tem direito a ele:
 *   /topic/chat/{cdInteresse}/...       -> os dois participantes da conversa
 *   /topic/comunidade/{cdComunidade}/... -> membros e criador da comunidade
 *   /topic/notificacoes/{cdUsuario}     -> o próprio usuário
 *   /topic/admin/...                    -> administradores
 * Inscrições sem permissão são descartadas em silêncio (o cliente só não recebe nada).
 * As permissões já confirmadas ficam guardadas na sessão para não consultar o banco de novo.
 */
@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    public static final String ATRIBUTO_CD_USUARIO = "cdUsuario";
    public static final String ATRIBUTO_NM_USUARIO = "nmUsuario";
    public static final String ATRIBUTO_FT_USUARIO = "ftUsuario";
    public static final String ATRIBUTO_PERFIL = "perfil";
    private static final String ATRIBUTO_CANAIS_LIBERADOS = "canaisLiberados";

    private static final Pattern CHAT = Pattern.compile("^/(?:topic|app)/chat/(\\d+)(?:/.*)?$");
    private static final Pattern COMUNIDADE = Pattern.compile("^/(?:topic|app)/comunidade/(\\d+)(?:/.*)?$");
    private static final Pattern NOTIFICACOES = Pattern.compile("^/topic/notificacoes/(\\d+)$");
    private static final Pattern ADMIN = Pattern.compile("^/topic/admin/.*$");

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private InteresseRepository interesseRepository;

    @Autowired
    private ComunidadeRepository comunidadeRepository;

    @Autowired
    private UsuarioComunidadeRepository usuarioComunidadeRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }

        Map<String, Object> sessao = accessor.getSessionAttributes();

        switch (accessor.getCommand()) {
            case CONNECT -> autenticar(accessor, sessao);
            case SUBSCRIBE, SEND -> {
                if (!podeUsarCanal(sessao, accessor.getDestination())) {
                    return null; // descarta a mensagem
                }
            }
            default -> { }
        }

        return message;
    }

    private void autenticar(StompHeaderAccessor accessor, Map<String, Object> sessao) {
        String cabecalho = accessor.getFirstNativeHeader("Authorization");
        if (sessao == null || cabecalho == null || !cabecalho.startsWith("Bearer ")) {
            throw new MessagingException("Conexão sem token.");
        }

        String token = cabecalho.substring(7);
        Usuario usuario;
        try {
            if (!jwtService.validarToken(token)) {
                throw new MessagingException("Token inválido.");
            }
            usuario = usuarioRepository.findByEmail(jwtService.getEmail(token))
                    .filter(Usuario::isAtivo)
                    .orElseThrow(() -> new MessagingException("Conta inexistente ou inativa."));
        } catch (MessagingException e) {
            throw e;
        } catch (Exception e) {
            throw new MessagingException("Token inválido.");
        }

        sessao.put(ATRIBUTO_CD_USUARIO, usuario.getCdUsuario());
        sessao.put(ATRIBUTO_NM_USUARIO, usuario.getNmUsuario());
        sessao.put(ATRIBUTO_PERFIL, usuario.getPerfil());
        if (usuario.getFtUsuario() != null) {
            sessao.put(ATRIBUTO_FT_USUARIO, usuario.getFtUsuario());
        }
    }

    private boolean podeUsarCanal(Map<String, Object> sessao, String destino) {
        if (sessao == null || destino == null
                || !(sessao.get(ATRIBUTO_CD_USUARIO) instanceof Long cdUsuario)) {
            return false;
        }

        Matcher m;

        if ((m = NOTIFICACOES.matcher(destino)).matches()) {
            return cdUsuario.equals(Long.valueOf(m.group(1)));
        }

        if (ADMIN.matcher(destino).matches()) {
            return sessao.get(ATRIBUTO_PERFIL) == Perfil.ADMINISTRADOR;
        }

        if ((m = CHAT.matcher(destino)).matches()) {
            Long cdInteresse = Long.valueOf(m.group(1));
            return liberado(sessao, "chat:" + cdInteresse,
                    () -> interesseRepository.participaDaConversa(cdInteresse, cdUsuario));
        }

        if ((m = COMUNIDADE.matcher(destino)).matches()) {
            Long cdComunidade = Long.valueOf(m.group(1));
            return liberado(sessao, "comunidade:" + cdComunidade,
                    () -> usuarioComunidadeRepository.existsByUsuarioCdUsuarioAndComunidadeCdComunidade(cdUsuario, cdComunidade)
                            || comunidadeRepository.existsByCdComunidadeAndUsuarioCria_CdUsuario(cdComunidade, cdUsuario));
        }

        return false; // canal desconhecido
    }

    @SuppressWarnings("unchecked")
    private boolean liberado(Map<String, Object> sessao, String canal, java.util.function.BooleanSupplier verificar) {
        Set<String> liberados = (Set<String>) sessao.computeIfAbsent(ATRIBUTO_CANAIS_LIBERADOS,
                k -> new HashSet<String>());

        synchronized (liberados) {
            if (liberados.contains(canal)) {
                return true;
            }
        }

        if (verificar.getAsBoolean()) {
            synchronized (liberados) {
                liberados.add(canal);
            }
            return true;
        }
        return false;
    }
}
