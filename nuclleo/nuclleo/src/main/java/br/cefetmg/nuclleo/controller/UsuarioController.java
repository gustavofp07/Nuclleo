package br.cefetmg.nuclleo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

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

    @PostMapping("")
    @Operation(summary = "Cadastrar usuário")
    public ResponseEntity<Usuario> inserir(@Valid @RequestBody Usuario usuario) {
        //depois verificar se o usuário (email) já existe, se não existir, insere. Se existir, ou mostra o erro, ou reativa a conta, pois não há excusão de usuário, apenas desativação.

        if (usuario == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuário é obrigatório");
        }

        if (usuario.getCdUsuario() == 0) {// gambiarra. Tem q tirar isso
            usuario.setCdUsuario(null);
        }

        Usuario objUsuario = usuarioService.inserir(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(objUsuario);
    }

    @PutMapping("")
    @Operation(summary = "Atualizar usuário")
    public ResponseEntity<Usuario> alterar(@RequestBody Usuario usuario) {
        if (usuario.getCdUsuario() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Id é obrigatório");
        }

        Usuario objUsuario = usuarioService.alterar(usuario);
        return ResponseEntity.ok(objUsuario);
    }    

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
        //return this.repository.findById(cdUsuario).orElse(null);
    }

}
