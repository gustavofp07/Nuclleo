package br.cefetmg.nuclleo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.cefetmg.nuclleo.dto.UsuarioLoginResponseDTO;
import br.cefetmg.nuclleo.dto.UsuarioLoginResquestDTO;
import br.cefetmg.nuclleo.exception.UnauthorizedException;
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
            throw new UnauthorizedException("Email e/ou senha inválidos");
        }

        //mudar isso futuramente
        if (!usuario.isAtivo()) {
            throw new UnauthorizedException("Usuário inativo");
        }

        return new UsuarioLoginResponseDTO(usuario);
    }

}
