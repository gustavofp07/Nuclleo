package br.cefetmg.nuclleo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.dto.UsuarioLoginResponseDTO;
import br.cefetmg.nuclleo.dto.UsuarioLoginResquestDTO;
import jakarta.validation.Valid;
import br.cefetmg.nuclleo.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/v1/autenticar")
@CrossOrigin(origins = "*")

public class AutenticacaoController {
    private UsuarioRepository repository;

    public AutenticacaoController(UsuarioRepository repository) {
        this.repository = repository;
    }

    @PostMapping("")
    public UsuarioLoginResponseDTO autenticar(@Valid @RequestBody UsuarioLoginResquestDTO credenciais) {

        Usuario usuario = repository.findByEmailAndSenha(credenciais.getEmail(), credenciais.getSenha());

        if (usuario == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha inválidos");
        }

        UsuarioLoginResponseDTO usuarioLogin = new UsuarioLoginResponseDTO(usuario);

        return usuarioLogin;
    }
}
