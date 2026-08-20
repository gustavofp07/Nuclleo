package br.cefetmg.nuclleo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import jakarta.validation.Valid;

import br.cefetmg.nuclleo.dto.MensagemDTO;
import br.cefetmg.nuclleo.dto.MensagemRequestDTO;
import br.cefetmg.nuclleo.services.MensagemService;

@Controller
public class ChatController {

    @Autowired
    private MensagemService mensagemService;

    @MessageMapping("/chat/{cdInteresse}")
    @SendTo("/topic/chat/{cdInteresse}")
    public MensagemDTO enviar(@DestinationVariable Long cdInteresse, @Valid @Payload MensagemRequestDTO dto) {
        return mensagemService.salvar(cdInteresse, dto);
    }
}