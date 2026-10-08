package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.cefetmg.nuclleo.dto.UsuarioRequestDTO;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.services.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin(origins = "*")
@Tag(name = "Admin", description = "Endpoints exclusivos para administradores")
public class AdminController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping(value = "/usuarios", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Cadastrar administrador")
    public ResponseEntity<Usuario> cadastrarAdmin(
            @Valid @RequestPart("usuario") UsuarioRequestDTO dto,
            @RequestPart(value = "foto", required = false) MultipartFile foto) {

        Usuario objUsuario = usuarioService.inserirAdmin(dto, foto);
        return ResponseEntity.status(HttpStatus.CREATED).body(objUsuario);
    }

    @GetMapping("/usuarios")
    @Operation(summary = "Listar todos os usuários")
    public ResponseEntity<List<Usuario>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }
}