package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
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

import br.cefetmg.nuclleo.model.Comunidade;
import br.cefetmg.nuclleo.repository.ComunidadeRepository;

@RestController
@RequestMapping("api/v1/comunidades")
@CrossOrigin(origins = "*")
public class ComunidadeController {
    private final ComunidadeRepository repository;

    ComunidadeController(ComunidadeRepository repository) {
        this.repository = repository;
    }

    @PostMapping()
    public Comunidade inserir(
            @RequestBody Comunidade comunidade) {

        comunidade.setCdComunidade(null);

        return this.repository.save(comunidade);

    }

    @DeleteMapping("/{cdComunidade}")
    public Comunidade excluir(@PathVariable Long cdComunidade) {
        Comunidade comunidade = this.repository.findById(cdComunidade).orElse(null); // mudar isso. Chamar o get
        if (comunidade == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Entidade com id: " + cdComunidade + "não encontrado.");
        }

        this.repository.deleteById(cdComunidade);
        return comunidade;
    }

    @GetMapping("")
    public List<Comunidade> getComunidades() {
        return this.repository.findAll();
    }

    @GetMapping("/{cdComunidade}") // http://localhost:8080/api/v1/comunidades/cdComunidade
    public Comunidade getComunidadeById(@PathVariable Long cdComunidade) {
        return this.repository.findById(cdComunidade).orElse(null);
    }

    @PutMapping("")
    public Comunidade alterar(@RequestBody Comunidade comunidade) {
        if (comunidade.getCdComunidade() == null) { // olhar isso aqui
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Id é obrigatório");
        }

        this.repository.save(comunidade);
        return comunidade;
    }

    @GetMapping("/usuario/{cdUsuario}")
    public List<Comunidade> getComunidadesUsuario(
            @PathVariable Long cdUsuario) {

        return this.repository
                .findByUsuarioCria_CdUsuario(
                        cdUsuario);

    }

}
