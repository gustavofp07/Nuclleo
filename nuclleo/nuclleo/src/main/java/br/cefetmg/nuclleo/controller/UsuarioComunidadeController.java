package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.cefetmg.nuclleo.model.UsuarioComunidade;
import br.cefetmg.nuclleo.repository.UsuarioComunidadeRepository;

@RestController
@RequestMapping("api/v1/UsuarioComunidade")
@CrossOrigin(origins = "*")
public class UsuarioComunidadeController {
    private final UsuarioComunidadeRepository repository;

    UsuarioComunidadeController(UsuarioComunidadeRepository repository) {
        this.repository = repository;
    }

    @PostMapping()
    public UsuarioComunidade inserir(@RequestBody UsuarioComunidade usuarioComunidade) {
        if (usuarioComunidade != null) {
            this.repository.save(usuarioComunidade);
        }
        return usuarioComunidade;
    }

    // URL: GET api/v1/UsuarioComunidade
    @GetMapping()
    public List<UsuarioComunidade> getUsuarioComunidade() {
        return this.repository.findAll();
    }

    // URL: GET api/v1/UsuarioComunidade/usuario?cdUsuario=1
    @GetMapping("/usuario")
    public List<UsuarioComunidade> getByUsuario(@RequestParam Long cdUsuario) {
        return this.repository.findByUsuarioCdUsuario(cdUsuario);
    }

    // URL: GET api/v1/UsuarioComunidade/comunidade?cdComunidade=1
    @GetMapping("/comunidade")
    public List<UsuarioComunidade> getByComunidade(@RequestParam Long cdComunidade) {
        return this.repository.findByComunidadeCdComunidade(cdComunidade);
    }

    // URL: DELETE api/v1/UsuarioComunidade/comunidade?cdComunidade=1
    @DeleteMapping("/comunidade")
    public List<UsuarioComunidade> excluirByCdComunidade(@RequestParam Long cdComunidade) {
        return this.repository.deleteByComunidadeCdComunidade(cdComunidade);
    }

    // URL: DELETE api/v1/UsuarioComunidade/usuario?cdUsuario=1
    @DeleteMapping("/usuario")
    public List<UsuarioComunidade> excluirByCdUsuario(@RequestParam Long cdUsuario) {
        return this.repository.deleteByUsuarioCdUsuario(cdUsuario);
    }

    // URL: DELETE api/v1/UsuarioComunidade/relacao?cdUsuario=1&cdComunidade=2
    @DeleteMapping("/relacao")
    public List<UsuarioComunidade> excluirRelacaoEspecifica(
            @RequestParam Long cdUsuario,
            @RequestParam Long cdComunidade) {
        return this.repository.deleteByUsuarioCdUsuarioAndComunidadeCdComunidade(cdUsuario, cdComunidade);
    }
}

/*
 * @PutMapping("")
 * public Comunidade alterar(@RequestBody Comunidade comunidade) {
 * if (comunidade.getCdComunidade() == null) { //olhar isso aqui
 * throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
 * "Id é obrigatório");
 * }
 * 
 * this.repository.save(comunidade);
 * return comunidade;
 * }
 */