package br.cefetmg.nuclleo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.cefetmg.nuclleo.dto.DenunciaRequestDTO;
import br.cefetmg.nuclleo.services.DenunciaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/denuncias")
@CrossOrigin(origins = "*")
@Tag(name = "Denúncias", description = "Endpoint para o usuário denunciar um anúncio ou uma conta")
public class DenunciaController {

    @Autowired
    private DenunciaService denunciaService;

    @PostMapping("")
    @Operation(summary = "Denunciar um anúncio ou um usuário (o denunciante vem do token)")
    public ResponseEntity<Void> denunciar(@Valid @RequestBody DenunciaRequestDTO dto,
            Authentication authentication) {
        denunciaService.inserir(dto, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
