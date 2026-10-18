package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.cefetmg.nuclleo.model.UsuarioComunidade;
import br.cefetmg.nuclleo.services.ComunidadeService;
import br.cefetmg.nuclleo.services.UsuarioComunidadeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("api/v1/usuarioComunidade")
@CrossOrigin(origins = "*")
@Tag(name = "Relações usuário-comunidade", description = "Endpoints para gerenciamento das relações entre usuários e comunidades")
public class UsuarioComunidadeController {
    @Autowired
    private UsuarioComunidadeService usuarioComunidadeService;

    @Autowired
    private ComunidadeService comunidadeService;

    @PostMapping("")
    @Operation(summary = "Inserir uma nova relação entre usuário e comunidade")
    public ResponseEntity<UsuarioComunidade> inserir(@Valid @RequestBody UsuarioComunidade dto,
            Authentication authentication) {
        // Do corpo só vale a comunidade; quem entra é o usuário logado
        Long cdComunidade = dto.getComunidade() != null ? dto.getComunidade().getCdComunidade() : null;
        UsuarioComunidade usuarioComunidade = usuarioComunidadeService.entrar(cdComunidade, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioComunidade);
    }

    @GetMapping("")
    @Operation(summary = "Listar todas as relações")
    public ResponseEntity<List<UsuarioComunidade>> listar() {
        List<UsuarioComunidade> usuarioComunidades = usuarioComunidadeService.listar();
        return ResponseEntity.ok(usuarioComunidades);
    }

    @GetMapping("/usuario")
    @Operation(summary = "Listar relações por usuário")
    public ResponseEntity<List<UsuarioComunidade>> listarPorUsuario(@RequestParam Long cdUsuario) {
        List<UsuarioComunidade> usuarioComunidades = usuarioComunidadeService.listarPorUsuario(cdUsuario);
        return ResponseEntity.ok(usuarioComunidades);
    }

    @GetMapping("/comunidade")
    @Operation(summary = "Listar relações por comunidade")
    public ResponseEntity<List<UsuarioComunidade>> listarPorComunidade(@RequestParam Long cdComunidade) {
        List<UsuarioComunidade> usuarioComunidades = usuarioComunidadeService.listarPorComunidade(cdComunidade);
        return ResponseEntity.ok(usuarioComunidades);
    }

    @DeleteMapping("/relacao")
    @Operation(summary = "Excluir relação específica")
    public void excluirRelacao(
            @RequestParam Long cdUsuario,
            @RequestParam Long cdComunidade,
            Authentication authentication) {
        // Só o próprio membro (saindo) ou o dono da comunidade
        comunidadeService.removerMembro(cdComunidade, cdUsuario, authentication.getName());
    }
}