package br.cefetmg.nuclleo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

import br.cefetmg.nuclleo.dto.UsuarioLoginResponseDTO;
import br.cefetmg.nuclleo.dto.UsuarioLoginResquestDTO;
import br.cefetmg.nuclleo.exception.UnauthorizedException;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.UsuarioRepository;
import br.cefetmg.nuclleo.security.JwtService;

@Service
public class AutenticacaoService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtService jwtService;

    public UsuarioLoginResponseDTO autenticar(UsuarioLoginResquestDTO credenciais) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            credenciais.getEmail(),
                            credenciais.getSenha()));
        } catch (AuthenticationException e) {
            throw new UnauthorizedException("Email e/ou senha inválidos");
        }

        Usuario usuario = usuarioRepository.findByEmail(credenciais.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Usuário não encontrado."));

        if (!usuario.isAtivo()) {
            throw new UnauthorizedException("Usuário inativo");
        }

        String token = jwtService.gerarToken(usuario);

        return new UsuarioLoginResponseDTO(token);
    }
}