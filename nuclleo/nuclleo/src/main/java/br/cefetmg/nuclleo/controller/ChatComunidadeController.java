package br.cefetmg.nuclleo.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import br.cefetmg.nuclleo.config.WebSocketAuthInterceptor;
import br.cefetmg.nuclleo.dto.DigitandoComunidadeDTO;

/**
 * Indicador "digitando" do chat da comunidade (via WebSocket).
 *
 * O WebSocketAuthInterceptor já garantiu que a conexão é autenticada e que o
 * usuário é membro da comunidade. O remetente vem da sessão, não do corpo,
 * então cada aviso é só repassado, sem consultar o banco.
 */
@Controller
public class ChatComunidadeController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/comunidade/{cdComunidade}/digitando")
    public void digitando(@DestinationVariable Long cdComunidade,
            @Payload DigitandoComunidadeDTO dto,
            SimpMessageHeaderAccessor headers) {

        Map<String, Object> sessao = headers.getSessionAttributes();
        if (sessao == null || !(sessao.get(WebSocketAuthInterceptor.ATRIBUTO_CD_USUARIO) instanceof Long cdUsuario)) {
            return;
        }

        DigitandoComunidadeDTO aviso = new DigitandoComunidadeDTO(
                cdUsuario,
                (String) sessao.get(WebSocketAuthInterceptor.ATRIBUTO_NM_USUARIO),
                (String) sessao.get(WebSocketAuthInterceptor.ATRIBUTO_FT_USUARIO),
                dto != null && dto.isDigitando());

        messagingTemplate.convertAndSend("/topic/comunidade/" + cdComunidade + "/digitando", aviso);
    }
}
