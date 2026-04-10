package br.cefetmg.nuclleo.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.cefetmg.nuclleo.model.Usuario;

@RestController
@RequestMapping("/api/v1/usuarios")

public class UsuarioController {

    private List<Usuario> usuarioList; // Simulando um banco de dados em memória
    private Long nextId = (long) 1; // Simulando auto-incremento de ID

    {
        usuarioList = new ArrayList<>();
        Usuario usuario1 = new Usuario();
        usuario1.setCdUsuario(nextId++);
        usuario1.setNmUsuario("Emanuel");
        
        Usuario usuario2 = new Usuario();
        usuario2.setCdUsuario(nextId++);
        usuario2.setNmUsuario("Cadu");

        usuarioList.add(usuario1);
        usuarioList.add(usuario2);
    }


    @GetMapping("") // http://localhost:8080/api/v1/usuarios
    public List<Usuario> getUsuarios() {
        return usuarioList;
    }

    @GetMapping("/{codigo}") //http://localhost:8080/api/v1/usuarios/numerodoId
    public Usuario getUsuarioById(@PathVariable Long codigo) {
        for (Usuario objUsuario : usuarioList) {
            if (objUsuario.getCdUsuario() == codigo) {
                return objUsuario;
            }
        }
        return null;
    }

    /*
    @GetMapping("")
    public Usuario getUsuarios() {
        Usuario usuario = new Usuario();
        usuario.setCdUsuario(1);
        usuario.setNmUsuario("João Silva");
        usuario.setEmail("joao@gmail.com");
        usuario.setSenha("senha123");
        usuario.setDtEntrada(new java.sql.Date(System.currentTimeMillis()));   
        usuario.setCpf("123.456.789-00");
        usuario.setCep("12345-678");
        usuario.setTelefone("(11) 98765-4321");
        usuario.setFtUsuario("foto.jpg");

        return usuario;
    }
        */

    @PostMapping("")
    public Usuario inserir(@RequestBody Usuario usuario) {
        usuario.setCdUsuario(nextId++);
        usuarioList.add(usuario);
        return usuario;
    }

    @DeleteMapping("/{cdUsuario}")
    public Usuario excluir(@PathVariable Long cdUsuario) {
        Usuario retorno = null;
        for(int i = 0; i < usuarioList.size(); i++) {
            Usuario userAux = usuarioList.get(i);
            if (userAux != null && userAux.getCdUsuario() == cdUsuario) {
                retorno = userAux;
                usuarioList.remove(i);
                break;
            }
        }

        return retorno;
    }

    @PutMapping("")
    public Usuario alterar(@RequestBody Usuario usuario) {

        for (int i = 0; i < usuarioList.size(); i++) {
            Usuario userAux = usuarioList.get(i);
            if (userAux != null && userAux.getCdUsuario() == usuario.getCdUsuario()) {
                usuarioList.remove(i);
                usuarioList.add(usuario);
                break;
            }
        }

        return usuario;
    }


}
