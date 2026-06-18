package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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
import br.cefetmg.nuclleo.services.UsuarioService;
import jakarta.validation.Valid;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/api/v1/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {
    @Autowired
    private UsuarioService usuarioService;

    public UsuarioController() {}

    @PostMapping("")
    @Operation(summary = "Cadastrar usuário")
    public ResponseEntity<Usuario> inserir(@Valid @RequestBody Usuario usuario) {
        if (usuario.getCdUsuario() == 0) {// gambiarra. Tem q tirar isso
            usuario.setCdUsuario(null);
        }

        java.sql.Date data = new java.sql.Date(System.currentTimeMillis());
        usuario.setDtEntrada(data);

        Usuario objUsuario = usuarioService.inserir(usuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(objUsuario);
    }

    @PutMapping("")
    @Operation(summary = "Atualizar usuário")
    public ResponseEntity<Usuario> alterar(@RequestBody Usuario usuario) {
        if (usuario.getCdUsuario() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Id é obrigatório");
        }

        //JogadorResponseDTO jogadorResponseDTO = jogadorService.atualizar(id, jogadorRequestDTO);
        Usuario objUsuario = usuarioService.alterar(usuario);
        return ResponseEntity.ok(objUsuario);
    }    

    @DeleteMapping("/{cdUsuario}")
    @Operation(summary = "Excluir usuário")
    public ResponseEntity<Usuario> excluir(@PathVariable Long cdUsuario) {
        Usuario objUsuario = usuarioService.excluir(cdUsuario);
        return ResponseEntity.status(HttpStatus.CREATED).body(objUsuario);
    }

    @GetMapping("/{cdUsuario}") // http://localhost:8080/api/v1/usuarios/numerodoId
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable Long cdUsuario) {
        Usuario objUsuario = usuarioService.buscarPorId(cdUsuario);
        return ResponseEntity.ok(objUsuario);
        //return this.repository.findById(cdUsuario).orElse(null);
    }

    /*
    @GetMapping
    @Operation(summary = "Listar jogadores")
    public ResponseEntity<List<JogadorResponseDTO>> listar() {
        List<JogadorResponseDTO> jogadores = jogadorService.listar();
        return ResponseEntity.ok(jogadores);
    }




     * @PostMapping("")
     * public Usuario inserir(@RequestBody Usuario usuario) {
     * if (usuario.getCdUsuario() == 0) {// gambiarra. Tem q tirar isso
     * usuario.setCdUsuario(null);
     * }
     * 
     * java.sql.Date data = new java.sql.Date(System.currentTimeMillis());
     * usuario.setDtEntrada(data);
     * 
     * return this.repository.save(usuario);
     * }
     

    @GetMapping("") // http://localhost:8080/api/v1/usuarios
    public List<Usuario> getUsuarios() {
        return this.repository.findAll();
    }

    @GetMapping("/{cdUsuario}") // http://localhost:8080/api/v1/usuarios/numerodoId
    public Usuario getUsuarioById(@PathVariable Long cdUsuario) {
        return this.repository.findById(cdUsuario).orElse(null);
    }

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
    }
        */

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