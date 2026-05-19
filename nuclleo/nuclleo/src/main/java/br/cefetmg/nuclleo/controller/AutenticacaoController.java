package br.cefetmg.nuclleo.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import br.cefetmg.nuclleo.model.Login;
import br.cefetmg.nuclleo.model.Usuario;
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
    public Usuario autenticar(@RequestBody Login credenciais) {

        Usuario usuario = repository.findByEmailAndSenha(
                credenciais.getEmail(),
                credenciais.getSenha());

        if (usuario == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha inválidos");
        }

        //criar um usuarioDTO para retornar só id, email, nome e foto
        usuario.setCep("");
        usuario.setCpf("");
        usuario.setDtEntrada(null);
        usuario.setTelefone("");
        usuario.setSenha(null);

        return usuario;
    }
}
