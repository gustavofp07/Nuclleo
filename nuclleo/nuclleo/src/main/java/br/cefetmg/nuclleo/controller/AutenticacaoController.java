package br.cefetmg.nuclleo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.cefetmg.nuclleo.dto.UsuarioLoginResponseDTO;
import br.cefetmg.nuclleo.dto.UsuarioLoginResquestDTO;
import jakarta.validation.Valid;
import br.cefetmg.nuclleo.services.AutenticacaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/autenticar")
@CrossOrigin(origins = "*")
@Tag(name = "Autenticação", description = "Endpoints para autenticação de usuário")
public class AutenticacaoController {
    @Autowired
    private AutenticacaoService autenticacaoService;

    @PostMapping("")
    @Operation(summary = "Autenticar usuário")
    public ResponseEntity<UsuarioLoginResponseDTO> autenticar(@Valid @RequestBody UsuarioLoginResquestDTO dto) {
        UsuarioLoginResponseDTO usuarioLogin = autenticacaoService.autenticar(dto);
        return ResponseEntity.ok(usuarioLogin);
    }
}
