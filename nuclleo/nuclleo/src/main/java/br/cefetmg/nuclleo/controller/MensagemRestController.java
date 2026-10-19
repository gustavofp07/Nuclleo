package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.cefetmg.nuclleo.dto.MensagemDTO;
import br.cefetmg.nuclleo.services.MensagemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/mensagens")
@CrossOrigin(origins = "*")
@Tag(name = "Mensagens", description = "Endpoints para o chat entre usuários")
public class MensagemRestController {

    @Autowired
    private MensagemService mensagemService;

    @GetMapping("/interesse/{cdInteresse}")
    @Operation(summary = "Histórico da conversa em páginas (somente participantes). "
            + "Sem 'antesDe' traz as mais recentes; com 'antesDe' traz as anteriores àquela mensagem.")
    public ResponseEntity<List<MensagemDTO>> listarPorInteresse(@PathVariable Long cdInteresse,
            @RequestParam(required = false) Long antesDe,
            @RequestParam(defaultValue = "50") int limite,
            Authentication authentication) {
        return ResponseEntity.ok(
                mensagemService.listarPorInteresse(cdInteresse, authentication.getName(), antesDe, limite));
    }

    @DeleteMapping("/{cdMensagem}")
    @Operation(summary = "Apagar mensagem para todos (somente o remetente; o usuário vem do token)")
    public ResponseEntity<MensagemDTO> apagar(@PathVariable Long cdMensagem, Authentication authentication) {
        return ResponseEntity.ok(mensagemService.apagar(cdMensagem, authentication.getName()));
    }
}