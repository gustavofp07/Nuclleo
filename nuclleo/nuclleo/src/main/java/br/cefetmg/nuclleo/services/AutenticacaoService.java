package br.cefetmg.nuclleo.services;

import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import br.cefetmg.nuclleo.dto.UsuarioLoginResponseDTO;
import br.cefetmg.nuclleo.dto.UsuarioLoginResquestDTO;
import br.cefetmg.nuclleo.exception.UnauthorizedException;
import br.cefetmg.nuclleo.model.Status;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.UsuarioRepository;
import br.cefetmg.nuclleo.security.JwtService;

@Service
public class AutenticacaoService {

    private static final DateTimeFormatter FORMATO_DATA = DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm");

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UsuarioLoginResponseDTO autenticar(UsuarioLoginResquestDTO credenciais) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            credenciais.getEmail(),
                            credenciais.getSenha()));
        } catch (DisabledException e) {
            // A conta está bloqueada. O Spring verifica isso ANTES da senha, então
            // conferimos a senha aqui para não revelar a situação da conta para
            // quem não sabe a senha.
            throw new UnauthorizedException(mensagemContaBloqueada(credenciais));
        } catch (AuthenticationException e) {
            throw new UnauthorizedException("Email e/ou senha inválidos");
        }

        Usuario usuario = usuarioRepository.findByEmail(credenciais.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Usuário não encontrado."));

        if (!usuario.isAtivo()) {
            throw new UnauthorizedException("Usuário inativo");
        }

        // A suspensão já venceu, mas a rotina agendada ainda não rodou:
        // reativa agora para os anúncios dele voltarem a aparecer na hora.
        if (usuario.getStatus() == Status.SUSPENSO) {
            usuario.setStatus(Status.ATIVO);
            usuario.setSuspensoAte(null);
            usuarioRepository.save(usuario);
        }

        String token = jwtService.gerarToken(usuario);

        return new UsuarioLoginResponseDTO(token);
    }

    private String mensagemContaBloqueada(UsuarioLoginResquestDTO credenciais) {
        Usuario usuario = usuarioRepository.findByEmail(credenciais.getEmail()).orElse(null);

        if (usuario == null || !passwordEncoder.matches(credenciais.getSenha(), usuario.getSenha())) {
            return "Email e/ou senha inválidos";
        }

        if (usuario.getStatus() == Status.SUSPENSO) {
            return usuario.getSuspensoAte() == null
                    ? "Sua conta foi suspensa permanentemente."
                    : "Sua conta está suspensa até " + usuario.getSuspensoAte().format(FORMATO_DATA) + ".";
        }

        return "Email e/ou senha inválidos";
    }
}
