package br.cefetmg.nuclleo.security;

import java.io.IOException;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;

import br.cefetmg.nuclleo.model.Perfil;
import br.cefetmg.nuclleo.model.Usuario;

/**
 * Esconde dados pessoais (CPF, CEP, e-mail) de quem não é o dono deles.
 *
 * O Usuario aparece dentro de muitas respostas (anúncio, transação, mensagem...),
 * então a regra fica aqui, na hora de gerar o JSON, e vale para todas de uma vez:
 * o valor só sai para o próprio usuário logado ou para um administrador.
 * Para os outros (e nas mensagens do WebSocket, que não têm usuário logado) sai null.
 */
public class DadoPessoalSerializer extends StdSerializer<String> {

    public DadoPessoalSerializer() {
        super(String.class);
    }

    @Override
    public void serialize(String valor, JsonGenerator gen, SerializerProvider provider) throws IOException {
        if (podeVer(gen.currentValue())) {
            gen.writeString(valor);
        } else {
            gen.writeNull();
        }
    }

    private boolean podeVer(Object dono) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        boolean admin = auth.getAuthorities().stream()
                .anyMatch(a -> Perfil.ADMINISTRADOR.name().equals(a.getAuthority()));
        if (admin) {
            return true;
        }

        return dono instanceof Usuario usuario
                && usuario.getEmail() != null
                && usuario.getEmail().equalsIgnoreCase(auth.getName());
    }
}
