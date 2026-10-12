package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.cefetmg.nuclleo.dto.MensagemComunidadeDTO;
import br.cefetmg.nuclleo.dto.MensagemComunidadeRequestDTO;
import br.cefetmg.nuclleo.services.MensagemComunidadeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/comunidades")
@CrossOrigin(origins = "*")
@Tag(name = "Chat da comunidade", description = "Mensagens do chat em grupo das comunidades")
public class MensagemComunidadeController {

    @Autowired
    private MensagemComunidadeService mensagemService;

    @GetMapping("/{cdComunidade}/mensagens")
    @Operation(summary = "Listar as mensagens mais recentes do chat (somente membros)")
    public ResponseEntity<List<MensagemComunidadeDTO>> listar(@PathVariable Long cdComunidade,
            Authentication authentication) {
        return ResponseEntity.ok(mensagemService.listar(cdComunidade, authentication.getName()));
    }

    @PostMapping("/{cdComunidade}/mensagens")
    @Operation(summary = "Enviar mensagem no chat (o remetente vem do token)")
    public ResponseEntity<MensagemComunidadeDTO> enviar(@PathVariable Long cdComunidade,
            @Valid @RequestBody MensagemComunidadeRequestDTO dto, Authentication authentication) {
        MensagemComunidadeDTO salva = mensagemService.enviar(cdComunidade, dto, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    @DeleteMapping("/mensagens/{cdMensagem}")
    @Operation(summary = "Apagar mensagem para todos (remetente ou criador da comunidade)")
    public ResponseEntity<MensagemComunidadeDTO> apagar(@PathVariable Long cdMensagem,
            Authentication authentication) {
        return ResponseEntity.ok(mensagemService.apagar(cdMensagem, authentication.getName()));
    }
}
