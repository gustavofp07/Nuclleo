package br.cefetmg.nuclleo.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import br.cefetmg.nuclleo.services.ComunidadeEventosService;

@RestController
@RequestMapping("/api/v1/eventos")
@CrossOrigin(origins = "*")
public class EventosController {

    private final ComunidadeEventosService eventosService;

    public EventosController(ComunidadeEventosService eventosService) {
        this.eventosService = eventosService;
    }

    @GetMapping(value = "/comunidade/{cdUsuario}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter assinar(@PathVariable Long cdUsuario) {
        return eventosService.registrar(cdUsuario);
    }
}