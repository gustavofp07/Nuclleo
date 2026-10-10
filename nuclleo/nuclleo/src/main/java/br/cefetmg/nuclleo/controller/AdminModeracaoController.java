package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.cefetmg.nuclleo.dto.AcaoModeracaoRequestDTO;
import br.cefetmg.nuclleo.dto.SuspensaoRequestDTO;
import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.Sancao;
import br.cefetmg.nuclleo.services.AnuncioService;
import br.cefetmg.nuclleo.services.ModeracaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

/**
 * Ações de moderação do administrador sobre contas e anúncios.
 * Todas as ações retornam a Sancao registrada no histórico.
 */
@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin(origins = "*")
@Tag(name = "Admin - Moderação", description = "Suspender, reativar e excluir contas e anúncios")
public class AdminModeracaoController {

    @Autowired
    private ModeracaoService moderacaoService;

    @Autowired
    private AnuncioService anuncioService;

    // ===================== CONTAS =====================

    @PutMapping("/usuarios/{cdUsuario}/suspender")
    @Operation(summary = "Suspender conta (1 a 7 dias)")
    public ResponseEntity<Sancao> suspenderUsuario(@PathVariable Long cdUsuario,
            @Valid @RequestBody SuspensaoRequestDTO dto,
            Authentication authentication) {
        return ResponseEntity.ok(moderacaoService.suspenderUsuario(cdUsuario, dto, authentication.getName()));
    }

    @PutMapping("/usuarios/{cdUsuario}/reativar")
    @Operation(summary = "Reativar conta suspensa antes do prazo")
    public ResponseEntity<Sancao> reativarUsuario(@PathVariable Long cdUsuario,
            @Valid @RequestBody(required = false) AcaoModeracaoRequestDTO dto,
            Authentication authentication) {
        return ResponseEntity.ok(moderacaoService.reativarUsuario(cdUsuario, dto, authentication.getName()));
    }

    @PutMapping("/usuarios/{cdUsuario}/excluir")
    @Operation(summary = "Excluir conta (exclusão lógica definitiva; motivo obrigatório)")
    public ResponseEntity<Sancao> excluirUsuario(@PathVariable Long cdUsuario,
            @Valid @RequestBody AcaoModeracaoRequestDTO dto,
            Authentication authentication) {
        return ResponseEntity.ok(moderacaoService.excluirUsuarioPeloAdmin(cdUsuario, dto, authentication.getName()));
    }

    @GetMapping("/usuarios/{cdUsuario}/sancoes")
    @Operation(summary = "Histórico de sanções de um usuário (inclui as dos anúncios dele)")
    public ResponseEntity<List<Sancao>> listarSancoes(@PathVariable Long cdUsuario) {
        return ResponseEntity.ok(moderacaoService.listarSancoesDoUsuario(cdUsuario));
    }

    // ===================== ANÚNCIOS =====================

    @GetMapping("/anuncios/{cdAnuncio}")
    @Operation(summary = "Buscar anúncio por id (qualquer status)")
    public ResponseEntity<Anuncio> buscarAnuncio(@PathVariable Long cdAnuncio) {
        return ResponseEntity.ok(anuncioService.buscarPorId(cdAnuncio));
    }

    @PutMapping("/anuncios/{cdAnuncio}/suspender")
    @Operation(summary = "Suspender anúncio (1 a 7 dias)")
    public ResponseEntity<Sancao> suspenderAnuncio(@PathVariable Long cdAnuncio,
            @Valid @RequestBody SuspensaoRequestDTO dto,
            Authentication authentication) {
        return ResponseEntity.ok(moderacaoService.suspenderAnuncio(cdAnuncio, dto, authentication.getName()));
    }

    @PutMapping("/anuncios/{cdAnuncio}/reativar")
    @Operation(summary = "Reativar anúncio suspenso antes do prazo")
    public ResponseEntity<Sancao> reativarAnuncio(@PathVariable Long cdAnuncio,
            @Valid @RequestBody(required = false) AcaoModeracaoRequestDTO dto,
            Authentication authentication) {
        return ResponseEntity.ok(moderacaoService.reativarAnuncio(cdAnuncio, dto, authentication.getName()));
    }

    @PutMapping("/anuncios/{cdAnuncio}/excluir")
    @Operation(summary = "Excluir anúncio (exclusão lógica definitiva; motivo obrigatório)")
    public ResponseEntity<Sancao> excluirAnuncio(@PathVariable Long cdAnuncio,
            @Valid @RequestBody AcaoModeracaoRequestDTO dto,
            Authentication authentication) {
        return ResponseEntity.ok(moderacaoService.excluirAnuncioPeloAdmin(cdAnuncio, dto, authentication.getName()));
    }
}
