package br.cefetmg.nuclleo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.cefetmg.nuclleo.dto.UsuarioRequestDTO;
import br.cefetmg.nuclleo.dto.VerificarEmailRequestDTO;
import br.cefetmg.nuclleo.exception.BadRequestException;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.services.UsuarioService;
import jakarta.validation.Valid;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/usuarios")
@CrossOrigin(origins = "*")
@Tag(name = "Usuários", description = "Endpoints para gerenciamento de usuários")
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Cadastrar usuário")
    public ResponseEntity<Usuario> inserir(@Valid @RequestPart("usuario") UsuarioRequestDTO dto,
            @RequestPart(value = "foto", required = false) MultipartFile foto) {
        if (dto == null) {
            throw new BadRequestException("Usuário é obrigatório");
        }

        Usuario objUsuario = usuarioService.inserir(dto, foto);
        return ResponseEntity.status(HttpStatus.CREATED).body(objUsuario);
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Atualizar usuário")
    public ResponseEntity<Usuario> alterar(
            @Valid @RequestPart("usuario") Usuario dto,
            @RequestPart(value = "foto", required = false) MultipartFile foto) {

        if (dto.getCdUsuario() == null) {
            throw new BadRequestException("Id do usuário é obrigatório.");
        }

        return ResponseEntity.ok(usuarioService.alterar(dto, foto));
    }

    /*
     * @PutMapping("")
     * 
     * @Operation(summary = "Atualizar usuário")
     * public ResponseEntity<Usuario> alterar(@RequestBody Usuario usuario) {
     * if (usuario.getCdUsuario() == null) {
     * throw new BadRequestException("Id é obrigatório");
     * }
     * 
     * Usuario objUsuario = usuarioService.alterar(usuario);
     * return ResponseEntity.ok(objUsuario);
     * }
     */

    @DeleteMapping("/{cdUsuario}")
    @Operation(summary = "Excluir usuário")
    public ResponseEntity<Usuario> excluir(@PathVariable Long cdUsuario) {
        Usuario objUsuario = usuarioService.excluir(cdUsuario);
        return ResponseEntity.ok(objUsuario);
    }

    @GetMapping("/{cdUsuario}") // http://localhost:8080/api/v1/usuarios/numerodoId
    @Operation(summary = "Buscar usuário por id")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable Long cdUsuario) {
        Usuario objUsuario = usuarioService.buscarPorId(cdUsuario);
        return ResponseEntity.ok(objUsuario);
        // return this.repository.findById(cdUsuario).orElse(null);
    }

    @GetMapping("/verificar-email")
    @Operation(summary = "Verificar se email já está cadastrado")
    public ResponseEntity<Boolean> verificarEmail(@RequestBody VerificarEmailRequestDTO dto) {

        boolean existe = usuarioService.verificarEmail(dto.getEmail());

        return ResponseEntity.ok(existe);
    }

    @GetMapping("/{cdUsuario}/possui-cep")
    @Operation(summary = "Verificar se usuário possui CEP cadastrado")
    public ResponseEntity<Boolean> verificarCep(
            @PathVariable Long cdUsuario) {

        boolean possuiCep = usuarioService.verificarCep(cdUsuario);

        return ResponseEntity.ok(possuiCep);
    }

    @GetMapping("/{cdUsuario}/possui-cpf")
    @Operation(summary = "Verificar se usuário possui CPF cadastrado")
    public ResponseEntity<Boolean> verificarCpf(
            @PathVariable Long cdUsuario) {

        boolean possuiCpf = usuarioService.verificarCpf(cdUsuario);

        return ResponseEntity.ok(possuiCpf);
    }

}
