package br.cefetmg.nuclleo.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import jakarta.validation.Valid;
import br.cefetmg.nuclleo.config.WebSocketAuthInterceptor;
import br.cefetmg.nuclleo.dto.DigitandoDTO;
import br.cefetmg.nuclleo.dto.MensagemDTO;
import br.cefetmg.nuclleo.dto.MensagemRequestDTO;
import br.cefetmg.nuclleo.exception.UnauthorizedException;
import br.cefetmg.nuclleo.services.MensagemService;

/**
 * Chat privado (via WebSocket). O WebSocketAuthInterceptor já garantiu que a
 * conexão é autenticada e que o usuário participa da conversa; quem envia vem
 * da sessão, nunca do corpo da mensagem.
 */
@Controller
public class ChatController {

    @Autowired
    private MensagemService mensagemService;

    @MessageMapping("/chat/{cdInteresse}")
    @SendTo("/topic/chat/{cdInteresse}")
    public MensagemDTO enviar(@DestinationVariable Long cdInteresse, @Valid @Payload MensagemRequestDTO dto,
            SimpMessageHeaderAccessor headers) {
        return mensagemService.salvar(cdInteresse, usuarioDaSessao(headers), dto);
    }

    @MessageMapping("/chat/{cdInteresse}/digitando")
    @SendTo("/topic/chat/{cdInteresse}/digitando")
    public DigitandoDTO digitando(@DestinationVariable Long cdInteresse, @Payload DigitandoDTO dto,
            SimpMessageHeaderAccessor headers) {
        dto.setCdUsuario(usuarioDaSessao(headers));
        return dto;
    }

    private Long usuarioDaSessao(SimpMessageHeaderAccessor headers) {
        Map<String, Object> sessao = headers.getSessionAttributes();
        if (sessao == null || !(sessao.get(WebSocketAuthInterceptor.ATRIBUTO_CD_USUARIO) instanceof Long cdUsuario)) {
            throw new UnauthorizedException("Conexão sem usuário autenticado.");
        }
        return cdUsuario;
    }
}
