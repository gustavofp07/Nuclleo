package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import br.cefetmg.nuclleo.model.UsuarioComunidade;
import br.cefetmg.nuclleo.repository.UsuarioComunidadeRepository;

@RestController
@RequestMapping("api/v1/usuarioComunidade")
@CrossOrigin(origins = "*")
public class UsuarioComunidadeController {
    private final UsuarioComunidadeRepository repository;

    UsuarioComunidadeController(UsuarioComunidadeRepository repository) {
        this.repository = repository;
    }

    /*
     * @PostMapping()
     * public UsuarioComunidade inserir(@RequestBody UsuarioComunidade
     * usuarioComunidade) {
     * //olhar isso aqui
     * usuarioComunidade.setId(null); // Garantir que o ID seja gerado
     * automaticamente
     * return this.repository.save(usuarioComunidade);
     * }
     */

    @PostMapping()
    public UsuarioComunidade inserir(@RequestBody UsuarioComunidade usuarioComunidade) {
        Long cdUsuario = usuarioComunidade.getUsuario().getCdUsuario();
        Long cdComunidade = usuarioComunidade.getComunidade().getCdComunidade();

        boolean existe = repository.existsByUsuarioCdUsuarioAndComunidadeCdComunidade(cdUsuario, cdComunidade);

        if (existe) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Usuário já participa desta comunidade.");
        }

        usuarioComunidade.setId(null);
        return repository.save(usuarioComunidade);
    }

    @GetMapping()
    public List<UsuarioComunidade> getUsuarioComunidade() {
        return this.repository.findAll();
    }

    @GetMapping("/usuario")
    public List<UsuarioComunidade> getByUsuario(@RequestParam Long cdUsuario) {
        return this.repository.findByUsuarioCdUsuario(cdUsuario);
    }

    @GetMapping("/comunidade")
    public List<UsuarioComunidade> getByComunidade(@RequestParam Long cdComunidade) {
        return this.repository.findByComunidadeCdComunidade(cdComunidade);
    }

    @DeleteMapping("/comunidade")
    public List<UsuarioComunidade> excluirByCdComunidade(@RequestParam Long cdComunidade) {
        return this.repository.deleteByComunidadeCdComunidade(cdComunidade);
    }

    @DeleteMapping("/usuario")
    public List<UsuarioComunidade> excluirByCdUsuario(@RequestParam Long cdUsuario) {
        return this.repository.deleteByUsuarioCdUsuario(cdUsuario);
    }

    @DeleteMapping("/relacao")
    public List<UsuarioComunidade> excluirRelacaoEspecifica(
            @RequestParam Long cdUsuario,
            @RequestParam Long cdComunidade) {
        return this.repository.deleteByUsuarioCdUsuarioAndComunidadeCdComunidade(cdUsuario, cdComunidade);
    }
}