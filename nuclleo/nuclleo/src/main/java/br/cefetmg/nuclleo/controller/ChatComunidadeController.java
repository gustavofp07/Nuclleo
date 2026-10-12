package br.cefetmg.nuclleo.controller;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import br.cefetmg.nuclleo.config.WebSocketAuthInterceptor;
import br.cefetmg.nuclleo.dto.DigitandoComunidadeDTO;
import br.cefetmg.nuclleo.services.MensagemComunidadeService;

/**
 * Indicador "digitando" do chat da comunidade (via WebSocket).
 *
 * Só funciona para conexões autenticadas no CONNECT (ver WebSocketAuthInterceptor).
 * O remetente vem da sessão, não do corpo. A verificação de "é membro?" é feita
 * uma única vez por comunidade e fica guardada na sessão, então cada aviso
 * é só repassado, sem consultar o banco.
 */
@Controller
public class ChatComunidadeController {

    private static final String ATRIBUTO_COMUNIDADES_LIBERADAS = "comunidadesLiberadas";

    @Autowired
    private MensagemComunidadeService mensagemComunidadeService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/comunidade/{cdComunidade}/digitando")
    public void digitando(@DestinationVariable Long cdComunidade,
            @Payload DigitandoComunidadeDTO dto,
            SimpMessageHeaderAccessor headers) {

        Map<String, Object> sessao = headers.getSessionAttributes();
        if (sessao == null || !(sessao.get(WebSocketAuthInterceptor.ATRIBUTO_CD_USUARIO) instanceof Long cdUsuario)) {
            return; // conexão sem login: ignora
        }

        if (!membroLiberado(sessao, cdComunidade, cdUsuario)) {
            return;
        }

        DigitandoComunidadeDTO aviso = new DigitandoComunidadeDTO(
                cdUsuario,
                (String) sessao.get(WebSocketAuthInterceptor.ATRIBUTO_NM_USUARIO),
                (String) sessao.get(WebSocketAuthInterceptor.ATRIBUTO_FT_USUARIO),
                dto != null && dto.isDigitando());

        messagingTemplate.convertAndSend("/topic/comunidade/" + cdComunidade + "/digitando", aviso);
    }

    @SuppressWarnings("unchecked")
    private boolean membroLiberado(Map<String, Object> sessao, Long cdComunidade, Long cdUsuario) {
        Set<Long> liberadas = (Set<Long>) sessao.computeIfAbsent(ATRIBUTO_COMUNIDADES_LIBERADAS,
                k -> new HashSet<Long>());

        if (liberadas.contains(cdComunidade)) {
            return true;
        }

        if (mensagemComunidadeService.podeUsarChat(cdComunidade, cdUsuario)) {
            liberadas.add(cdComunidade);
            return true;
        }
        return false;
    }
}
