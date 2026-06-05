package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
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
import br.cefetmg.nuclleo.repository.AnuncioComunidadeRepository;
import br.cefetmg.nuclleo.repository.ComunidadeRepository;
import br.cefetmg.nuclleo.repository.UsuarioComunidadeRepository;

@RestController
@RequestMapping("api/v1/comunidades")
@CrossOrigin(origins = "*")
public class ComunidadeController {
    private final ComunidadeRepository repository;
    private final AnuncioComunidadeRepository anuncioComunidadeRepository;
    private final UsuarioComunidadeRepository usuarioComunidadeRepository;

    ComunidadeController(
            ComunidadeRepository repository,
            AnuncioComunidadeRepository anuncioComunidadeRepository,
            UsuarioComunidadeRepository usuarioComunidadeRepository) {
        this.repository = repository;
        this.anuncioComunidadeRepository = anuncioComunidadeRepository;
        this.usuarioComunidadeRepository = usuarioComunidadeRepository;
    }

    @PostMapping()
    public Comunidade inserir(@RequestBody Comunidade comunidade) {
        comunidade.setCdComunidade(null);

        java.sql.Date data = new java.sql.Date(System.currentTimeMillis());
        comunidade.setDtCriacao(data);

        return this.repository.save(comunidade);
    }

    @PutMapping("/{cdComunidade}")
    public Comunidade alterar(@PathVariable Long cdComunidade, @RequestBody Comunidade comunidade) {

        if (repository.existsById(cdComunidade) == false) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidade não encontrada.");
        }

        comunidade.setCdComunidade(cdComunidade);
        return repository.save(comunidade);
    }

    @Transactional
    @DeleteMapping("/{cdComunidade}")
    public Comunidade excluir(@PathVariable Long cdComunidade) {
        Comunidade comunidade = this.repository.findById(cdComunidade).orElse(null); // mudar isso. Chamar o get
        if (comunidade == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Entidade com id: " + cdComunidade + "não encontrado.");
        }

        this.anuncioComunidadeRepository.deleteByComunidadeCdComunidade(cdComunidade);
        this.usuarioComunidadeRepository.deleteByComunidadeCdComunidade(cdComunidade);
        this.repository.deleteById(cdComunidade);
        return comunidade;
    }

    // tirar depois
    @GetMapping("")
    public List<Comunidade> getComunidades() {
        return this.repository.findAll();
    }

    @GetMapping("/{cdComunidade}") // http://localhost:8080/api/v1/comunidades/cdComunidade
    public Comunidade getComunidadeById(@PathVariable Long cdComunidade) {
        return this.repository.findById(cdComunidade).orElse(null);
    }

    @GetMapping("/usuario/{cdUsuario}")
    public List<Comunidade> getComunidadesUsuario(@PathVariable Long cdUsuario) {
        return this.repository.findByUsuarioCria_CdUsuario(cdUsuario);
    }
}
