package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.cefetmg.nuclleo.dto.MensagemDTO;
import br.cefetmg.nuclleo.services.MensagemService;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/mensagens")
@CrossOrigin(origins = "*")
@Tag(name = "Mensagens", description = "Endpoints para o chat entre usuários")
public class MensagemRestController {

    @Autowired
    private MensagemService mensagemService;

    @GetMapping("/interesse/{cdInteresse}")
    public ResponseEntity<List<MensagemDTO>> listarPorInteresse(@PathVariable Long cdInteresse) {
        if (cdInteresse == null) {
            throw new IllegalArgumentException("O campo código do interesse é obrigatório.");
        }

        List<MensagemDTO> mensagens = mensagemService.listarPorInteresse(cdInteresse);
        return ResponseEntity.ok(mensagens);
    }
}