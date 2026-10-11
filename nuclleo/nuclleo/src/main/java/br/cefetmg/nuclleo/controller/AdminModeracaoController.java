package br.cefetmg.nuclleo.controller;

import java.util.List;
import java.util.stream.Collectors;

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
import br.cefetmg.nuclleo.dto.SancaoResponseDTO;
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
    public ResponseEntity<SancaoResponseDTO> suspenderUsuario(@PathVariable Long cdUsuario,
            @Valid @RequestBody SuspensaoRequestDTO dto,
            Authentication authentication) {
                Sancao sancao = moderacaoService.suspenderUsuario(cdUsuario, dto, authentication.getName());
                SancaoResponseDTO dtoResponse = new SancaoResponseDTO(sancao);
        return ResponseEntity.ok(dtoResponse);
    }

    @PutMapping("/usuarios/{cdUsuario}/reativar")
    @Operation(summary = "Reativar conta suspensa antes do prazo")
    public ResponseEntity<SancaoResponseDTO> reativarUsuario(@PathVariable Long cdUsuario, Authentication authentication) {
        Sancao sancao = moderacaoService.reativarUsuario(cdUsuario, authentication.getName());
        SancaoResponseDTO dtoResponse = new SancaoResponseDTO(sancao);
        return ResponseEntity.ok(dtoResponse);
    }

    @PutMapping("/usuarios/{cdUsuario}/excluir")
    @Operation(summary = "Excluir conta (exclusão lógica definitiva)")
    public ResponseEntity<SancaoResponseDTO> excluirUsuario(@PathVariable Long cdUsuario,
            @Valid @RequestBody AcaoModeracaoRequestDTO dto,
            Authentication authentication) {
        Sancao sancao = moderacaoService.excluirUsuarioPeloAdmin(cdUsuario, dto, authentication.getName());
        SancaoResponseDTO dtoResponse = new SancaoResponseDTO(sancao);
        return ResponseEntity.ok(dtoResponse);
    }

    @GetMapping("/usuarios/{cdUsuario}/sancoes")
    @Operation(summary = "Histórico de sanções de um usuário (inclui as dos anúncios dele)")
    public ResponseEntity<List<SancaoResponseDTO>> listarSancoes(@PathVariable Long cdUsuario) {
        List<Sancao> sancoes = moderacaoService.listarSancoesDoUsuario(cdUsuario);
        List<SancaoResponseDTO> dtoResponse = sancoes.stream().map(SancaoResponseDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtoResponse);
    }

    @GetMapping("/sancoes/minhas")
    @Operation(summary = "Sanções aplicadas pelo administrador logado")
    public ResponseEntity<List<SancaoResponseDTO>> listarSancoesAplicadas(Authentication authentication) {
        List<SancaoResponseDTO> dtoResponse = moderacaoService.listarSancoesAplicadas(authentication.getName())
                .stream().map(SancaoResponseDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtoResponse);
    }

    // ===================== ANÚNCIOS =====================

    @GetMapping("/usuarios/{cdUsuario}/anuncios")
    @Operation(summary = "Anúncios de um usuário (qualquer status, menos EXCLUIDO)")
    public ResponseEntity<List<Anuncio>> listarAnunciosDoUsuario(@PathVariable Long cdUsuario) {
        return ResponseEntity.ok(anuncioService.listarTodosDoUsuario(cdUsuario));
    }

    @GetMapping("/anuncios/{cdAnuncio}")
    @Operation(summary = "Buscar anúncio por id (qualquer status)")
    public ResponseEntity<Anuncio> buscarAnuncio(@PathVariable Long cdAnuncio) {
        return ResponseEntity.ok(anuncioService.buscarPorId(cdAnuncio));
    }

    @PutMapping("/anuncios/{cdAnuncio}/suspender")
    @Operation(summary = "Suspender anúncio (1 a 7 dias)")
    public ResponseEntity<SancaoResponseDTO> suspenderAnuncio(@PathVariable Long cdAnuncio,
            @Valid @RequestBody SuspensaoRequestDTO dto,
            Authentication authentication) {
        Sancao sancao = moderacaoService.suspenderAnuncio(cdAnuncio, dto, authentication.getName());
        SancaoResponseDTO dtoResponse = new SancaoResponseDTO(sancao);
        return ResponseEntity.ok(dtoResponse);
    }

    @PutMapping("/anuncios/{cdAnuncio}/reativar")
    @Operation(summary = "Reativar anúncio suspenso antes do prazo")
    public ResponseEntity<SancaoResponseDTO> reativarAnuncio(@PathVariable Long cdAnuncio, Authentication authentication) {
        Sancao sancao = moderacaoService.reativarAnuncio(cdAnuncio, authentication.getName());
        SancaoResponseDTO dtoResponse = new SancaoResponseDTO(sancao);
        return ResponseEntity.ok(dtoResponse);
    }

    @PutMapping("/anuncios/{cdAnuncio}/excluir")
    @Operation(summary = "Excluir anúncio (exclusão lógica definitiva)")
    public ResponseEntity<SancaoResponseDTO> excluirAnuncio(@PathVariable Long cdAnuncio,
            @Valid @RequestBody AcaoModeracaoRequestDTO dto,
            Authentication authentication) {
        Sancao sancao = moderacaoService.excluirAnuncioPeloAdmin(cdAnuncio, dto, authentication.getName());
        SancaoResponseDTO dtoResponse = new SancaoResponseDTO(sancao);
        return ResponseEntity.ok(dtoResponse);
    }
}
