package br.cefetmg.nuclleo.controller;

//import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
//import org.springframework.http.HttpStatusCode;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.UsuarioRepository;

@RestController
@RequestMapping("/api/v1/usuarios")
@CrossOrigin(origins = "*")

public class UsuarioController {
    private UsuarioRepository repository;
    //private List<Usuario> usuarioList; // Simulando um banco de dados em memória
    //private Long nextId = (long) 1; // Simulando auto-incremento de ID

    public UsuarioController(UsuarioRepository repository) {
        this.repository = repository;
    }

    {
        /*
        usuarioList = new ArrayList<>();
        Usuario usuario1 = new Usuario();
        usuario1.setCdUsuario(nextId++);
        usuario1.setNmUsuario("Emanuel");
        
        Usuario usuario2 = new Usuario();
        usuario2.setCdUsuario(nextId++);
        usuario2.setNmUsuario("Cadu");

        usuarioList.add(usuario1);
        usuarioList.add(usuario2);
        */
    }


    @GetMapping("") // http://localhost:8080/api/v1/usuarios
    public List<Usuario> getUsuarios() {
        return this.repository.findAll();
    }

    @GetMapping("/{codigo}") //http://localhost:8080/api/v1/usuarios/numerodoId
    public Usuario getUsuarioById(@PathVariable Long codigo) {
        return this.repository.findById(codigo).orElse(null);

        /*
        for (Usuario objUsuario : usuarioList) {
            if (objUsuario.getCdUsuario() == codigo) {
                return objUsuario;
            }
        }
        return null;
        */
    }

    @PostMapping("")
    public Usuario inserir(@RequestBody Usuario usuario) {
        //usuario.setCdUsuario(nextId++);
        //usuarioList.add(usuario);
        usuario.setCdUsuario(null); // opcional
        repository.save(usuario);
        return usuario;
    }

    @DeleteMapping("/{cdUsuario}")
    public Usuario excluir(@PathVariable Long cdUsuario) {
        Usuario usuario = this.repository.findById(cdUsuario).orElse(null); //mudar isso. Chamar o get
        if (usuario == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Entidade com id" + cdUsuario + "não encontrado.");
        }

        this.repository.deleteById(cdUsuario);
        return usuario;

        /* 
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
        */
    }

    @PutMapping("")
    public Usuario alterar(@RequestBody Usuario usuario) {
        if (usuario.getCdUsuario() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Id é obrigatório");
        }

        this.repository.save(usuario);
        return usuario;

        /*
        for (int i = 0; i < usuarioList.size(); i++) {
            Usuario userAux = usuarioList.get(i);
            if (userAux != null && userAux.getCdUsuario() == usuario.getCdUsuario()) {
                usuarioList.remove(i);
                usuarioList.add(usuario);
                break;
            }
        }
        return usuario;
        */
    }
}

/*
@RestController
@RequestMapping("/api/v1/usuarios")
public class UsuarioController {

    private UsuarioRepository repository;

    public UsuarioController(UsuarioRepository repository) {
        this.repository = repository;
    }

    @GetMapping("")
    public List<Usuario> getUsuarios() {
        return repository.findAll();
    }

    @GetMapping("/{codigo}")
    public Usuario getUsuarioById(@PathVariable Long codigo) {
        return repository.findById(codigo).orElse(null);
    }

    @PostMapping("")
    public Usuario inserir(@RequestBody Usuario usuario) {
        usuario.setCdUsuario(null); // opcional
        return repository.save(usuario);
    }

    @DeleteMapping("/{cdUsuario}")
    public void excluir(@PathVariable Long cdUsuario) {
        repository.deleteById(cdUsuario);
    }

    @PutMapping("")
    public Usuario alterar(@RequestBody Usuario usuario) {
        return repository.save(usuario);
    }
}
 */