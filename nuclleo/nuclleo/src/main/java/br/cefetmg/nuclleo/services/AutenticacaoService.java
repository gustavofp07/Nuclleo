package br.cefetmg.nuclleo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import br.cefetmg.nuclleo.dto.UsuarioLoginResponseDTO;
import br.cefetmg.nuclleo.dto.UsuarioLoginResquestDTO;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.UsuarioRepository;
import jakarta.transaction.Transactional;

@Service
public class AutenticacaoService {
    @Autowired
    private UsuarioRepository repository;   

    @Transactional
    public UsuarioLoginResponseDTO autenticar(UsuarioLoginResquestDTO credenciais) {
        Usuario usuario = repository.findByEmailAndSenha(credenciais.getEmail(), credenciais.getSenha());

        if (usuario == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha inválidos");
        }

        return new UsuarioLoginResponseDTO(usuario);
    }

}
