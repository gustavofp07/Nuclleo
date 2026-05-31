package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
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

    public UsuarioController(UsuarioRepository repository) {
        this.repository = repository;
    }

    {
        /*
         * usuarioList = new ArrayList<>();
         * Usuario usuario1 = new Usuario();
         * usuario1.setCdUsuario(nextId++);
         * usuario1.setNmUsuario("Emanuel");
         * 
         * Usuario usuario2 = new Usuario();
         * usuario2.setCdUsuario(nextId++);
         * usuario2.setNmUsuario("Cadu");
         * 
         * usuarioList.add(usuario1);
         * usuarioList.add(usuario2);
         */
    }

    @GetMapping("") // http://localhost:8080/api/v1/usuarios
    public List<Usuario> getUsuarios() {
        return this.repository.findAll();
    }

    @GetMapping("/{cdUsuario}") // http://localhost:8080/api/v1/usuarios/numerodoId
    public Usuario getUsuarioById(@PathVariable Long cdUsuario) {
        return this.repository.findById(cdUsuario).orElse(null);
    }

    @PostMapping("")
    public Usuario inserir(@RequestBody Usuario usuario) {
        if (usuario.getCdUsuario() == 0) {// gambiarra. Tem q tirar isso
            usuario.setCdUsuario(null);
        }

        java.sql.Date data = new java.sql.Date(System.currentTimeMillis());
        usuario.setDtEntrada(data);

        return this.repository.save(usuario);
    }

    /*
     * @DeleteMapping("/{cdUsuario}")
     * public Usuario excluir(@PathVariable Long cdUsuario) {
     * Usuario usuario = this.repository.findById(cdUsuario).orElse(null); // mudar
     * isso. Chamar o get
     * if (usuario == null) {
     * throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Entidade com id" +
     * cdUsuario + "não encontrado.");
     * }
     * 
     * this.repository.deleteById(cdUsuario);
     * return usuario;
     * }
     */

    @DeleteMapping("/{cdUsuario}")
    public ResponseEntity<Usuario> excluir(@PathVariable Long cdUsuario) {
        Usuario usuario = this.repository.findById(cdUsuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));

        try {
            this.repository.delete(usuario);
            return ResponseEntity.ok(usuario);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não foi possível excluir o usuário.");
        }
    }

    @PutMapping("")
    public Usuario alterar(@RequestBody Usuario usuario) {
        if (usuario.getCdUsuario() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Id é obrigatório");
        }

        return this.repository.save(usuario);

        /*
         * for (int i = 0; i < usuarioList.size(); i++) {
         * Usuario userAux = usuarioList.get(i);
         * if (userAux != null && userAux.getCdUsuario() == usuario.getCdUsuario()) {
         * usuarioList.remove(i);
         * usuarioList.add(usuario);
         * break;
         * }
         * }
         * return usuario;
         */
    }
}

/*
 * @RestController
 * 
 * @RequestMapping("/api/v1/usuarios")
 * public class UsuarioController {
 * 
 * private UsuarioRepository repository;
 * 
 * public UsuarioController(UsuarioRepository repository) {
 * this.repository = repository;
 * }
 * 
 * @GetMapping("")
 * public List<Usuario> getUsuarios() {
 * return repository.findAll();
 * }
 * 
 * @GetMapping("/{codigo}")
 * public Usuario getUsuarioById(@PathVariable Long codigo) {
 * return repository.findById(codigo).orElse(null);
 * }
 * 
 * @PostMapping("")
 * public Usuario inserir(@RequestBody Usuario usuario) {
 * usuario.setCdUsuario(null); // opcional
 * return repository.save(usuario);
 * }
 * 
 * @DeleteMapping("/{cdUsuario}")
 * public void excluir(@PathVariable Long cdUsuario) {
 * repository.deleteById(cdUsuario);
 * }
 * 
 * @PutMapping("")
 * public Usuario alterar(@RequestBody Usuario usuario) {
 * return repository.save(usuario);
 * }
 * }
 */