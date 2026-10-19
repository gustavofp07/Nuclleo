package br.cefetmg.nuclleo.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import br.cefetmg.nuclleo.Fixtures;
import br.cefetmg.nuclleo.model.Usuario;

class DadoPessoalSerializerTest {

    private final ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @AfterEach
    void limparLogin() {
        SecurityContextHolder.clearContext();
    }

    private static void logar(String email, String perfil) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                email, null, List.of(new SimpleGrantedAuthority(perfil))));
    }

    private JsonNode json(Usuario usuario) {
        return mapper.valueToTree(usuario);
    }

    private static Usuario ana() {
        Usuario ana = Fixtures.usuario(1, "ana@gmail.com");
        ana.setCpf("12345678909");
        ana.setCep("35180008");
        return ana;
    }

    @Test
    void donoVeOsPropriosDados() {
        logar("ana@gmail.com", "USUARIO");
        JsonNode json = json(ana());

        assertEquals("12345678909", json.get("cpf").asText());
        assertEquals("35180008", json.get("cep").asText());
        assertEquals("ana@gmail.com", json.get("email").asText());
    }

    @Test
    void outroUsuarioNaoVeCpfCepNemEmail() {
        logar("pedro@gmail.com", "USUARIO");
        JsonNode json = json(ana());

        assertTrue(json.get("cpf").isNull());
        assertTrue(json.get("cep").isNull());
        assertTrue(json.get("email").isNull());
        // Mas o perfil público ainda sabe o nível de cadastro
        assertTrue(json.get("possuiCpf").asBoolean());
        assertTrue(json.get("possuiCep").asBoolean());
    }

    @Test
    void administradorVeOsDados() {
        logar("admin@nuclleo.com", "ADMINISTRADOR");
        assertEquals("12345678909", json(ana()).get("cpf").asText());
    }

    @Test
    void semLoginNadaSai() {
        JsonNode json = json(ana());
        assertTrue(json.get("cpf").isNull());
        assertTrue(json.get("email").isNull());
    }

    @Test
    void senhaNuncaSai() {
        logar("ana@gmail.com", "USUARIO");
        Usuario ana = ana();
        ana.setSenha("hash");
        assertNull(json(ana).get("senha"));
    }
}
