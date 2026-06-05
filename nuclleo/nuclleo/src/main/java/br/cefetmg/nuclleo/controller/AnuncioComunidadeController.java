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

import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.AnuncioComunidade;
import br.cefetmg.nuclleo.repository.AnuncioComunidadeRepository;

@RestController
@RequestMapping("api/v1/anuncioComunidade")
@CrossOrigin(origins = "*")
public class AnuncioComunidadeController {
    private final AnuncioComunidadeRepository repository;

    public AnuncioComunidadeController(AnuncioComunidadeRepository repository) {
        this.repository = repository;
    }

    @PostMapping()
    public AnuncioComunidade inserir(@RequestBody AnuncioComunidade anuncioComunidade) {
        if (anuncioComunidade != null) {
            this.repository.save(anuncioComunidade);
        }
        return anuncioComunidade;
    }

    @PostMapping("/relacoes")
    public List<AnuncioComunidade> inserirRelacoes(@RequestBody List<AnuncioComunidade> relacoes) {
        return repository.saveAll(relacoes);
    }

    @GetMapping("/comunidade/anuncios")
    public List<Anuncio> getAnunciosDaComunidade(
            @RequestParam Long cdComunidade) {

        return repository.findAnunciosByComunidade(cdComunidade);
    }

    // URL: GET api/v1/AnuncioComunidade
    @GetMapping()
    public List<AnuncioComunidade> getAnuncioComunidade() {
        return this.repository.findAll();
    }

    // URL: GET api/v1/AnuncioComunidade/
    @GetMapping("/anuncio")
    public List<AnuncioComunidade> getByAnuncio(@RequestParam Long cdAnuncio) {
        return this.repository.findByAnuncioCdAnuncio(cdAnuncio);
    }

    // URL: GET api/v1/AnuncioComunidade/comunidade?cdComunidade=1
    @GetMapping("/comunidade")
    public List<AnuncioComunidade> getByComunidade(@RequestParam Long cdComunidade) {
        return this.repository.findByComunidadeCdComunidade(cdComunidade);
    }

    // URL: DELETE api/v1/AnuncioComunidade/comunidade?cdComunidade=1
    @DeleteMapping("/comunidade")
    public List<AnuncioComunidade> excluirByCdComunidade(@RequestParam Long cdComunidade) {
        return this.repository.deleteByComunidadeCdComunidade(cdComunidade);
    }

    // URL: DELETE api/v1/AnuncioComunidade/anuncio?cdAnuncio=1
    @DeleteMapping("/anuncio")
    public List<AnuncioComunidade> excluirByCdAnuncio(@RequestParam Long cdAnuncio) {
        return this.repository.deleteByAnuncioCdAnuncio(cdAnuncio);
    }

    // URL: DELETE api/v1/AnuncioComunidade/relacao?cdAnuncio=1&cdComunidade=2
    // Deleta a relação específica de um anúncio em uma comunidade. Não retorna
    // lista, pois é uma relação específica.
    @DeleteMapping("/relacao")
    public List<AnuncioComunidade> excluirRelacaoEspecifica(@RequestParam Long cdAnuncio,
            @RequestParam Long cdComunidade) {
        return this.repository.deleteByAnuncioCdAnuncioAndComunidadeCdComunidade(cdAnuncio, cdComunidade);
    }
}
