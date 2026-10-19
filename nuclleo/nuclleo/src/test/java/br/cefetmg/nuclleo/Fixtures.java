package br.cefetmg.nuclleo;

import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.AnuncioVenda;
import br.cefetmg.nuclleo.model.Interesse;
import br.cefetmg.nuclleo.model.Perfil;
import br.cefetmg.nuclleo.model.Usuario;

/** Objetos de teste montados em memória (sem banco). */
public final class Fixtures {

    private Fixtures() {
    }

    public static Usuario usuario(long cd, String email) {
        Usuario usuario = new Usuario();
        usuario.setCdUsuario(cd);
        usuario.setNmUsuario("Usuário " + cd);
        usuario.setEmail(email);
        usuario.setPerfil(Perfil.USUARIO);
        return usuario;
    }

    public static Anuncio anuncio(long cd, Usuario dono) {
        AnuncioVenda anuncio = new AnuncioVenda();
        anuncio.setCdAnuncio(cd);
        anuncio.setUsuarioCria(dono);
        return anuncio;
    }

    public static Interesse interesse(long id, Usuario interessado, Anuncio anuncio) {
        Interesse interesse = new Interesse();
        interesse.setId(id);
        interesse.setUsuario(interessado);
        interesse.setAnuncio(anuncio);
        interesse.setConversaIniciada(true);
        interesse.setAceito(true);
        return interesse;
    }
}
