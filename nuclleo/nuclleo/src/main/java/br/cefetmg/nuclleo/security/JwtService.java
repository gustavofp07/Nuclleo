package br.cefetmg.nuclleo.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import br.cefetmg.nuclleo.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    private SecretKey getChave() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String gerarToken(Usuario usuario) {
        Date agora = new Date();
        Date expiracao = new Date(agora.getTime() + expiration);

        return Jwts.builder()
                .subject(usuario.getEmail())
                .claim("cdUsuario", usuario.getCdUsuario())
                .claim("nmUsuario", usuario.getNmUsuario())
                .claim("ftUsuario", usuario.getFtUsuario())
                .claim("perfil", usuario.getPerfil().name())
                .issuedAt(agora)
                .expiration(expiracao)
                .signWith(getChave())
                .compact();
    }

    public String getEmail(String token) {
        return getClaims(token).getSubject();
    }

    public Long getCdUsuario(String token) {
        Number id = getClaims(token).get("cdUsuario", Number.class);
        return id.longValue();
    }

    public String getPerfil(String token) {
        return getClaims(token).get("perfil", String.class);
    }

    public boolean validarToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getChave())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}