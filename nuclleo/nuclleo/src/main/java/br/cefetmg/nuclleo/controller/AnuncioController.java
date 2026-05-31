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

import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.repository.AnuncioRepository;

@RestController
@RequestMapping("/api/v1/anuncios")
@CrossOrigin(origins = "*")
public class AnuncioController {
    private AnuncioRepository repository;

    public AnuncioController(AnuncioRepository repository) {
        this.repository = repository;
    }

    // o post e o put não sei se são necessários, acredito que vale mais a pena
    // criar um endpoint específico para cada tipo de anúncio.

    /* 
    @PostMapping("")
    public Anuncio inserir(@RequestBody Anuncio anuncio) {
        if (anuncio.getCdAnuncio() != null) { // gambiarra. Tem q tirar isso
            anuncio.setCdAnuncio(null);
        }

        

        return this.repository.save(anuncio);
    }

    @PutMapping("")
    public Anuncio alterar(@RequestBody Anuncio anuncio) {
        if (anuncio.getCdAnuncio() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Id é obrigatório");
        }

        return this.repository.save(anuncio);
    }
    */

    @GetMapping("")
    public List<Anuncio> getAnuncios() {
        return this.repository.findAll();
    }

    @GetMapping("/{cdAnuncio}")
    public Anuncio getAnuncioById(@PathVariable Long cdAnuncio) {

        return this.repository.findById(cdAnuncio).orElse(null);

        /*
         * return this.repository.findById(cdAnuncio)
         * .orElseThrow(() ->
         * new ResponseStatusException(
         * HttpStatus.NOT_FOUND,
         * "Anúncio não encontrado."
         * )
         * );
         */
    }

    // retorna os anúncios de um usuário
    @GetMapping("/usuario/{cdUsuario}")
    public List<Anuncio> getAnunciosByUsuario(@PathVariable Long cdUsuario) {
        return this.repository.findByUsuarioCria_CdUsuario(cdUsuario);
    }

    @DeleteMapping("/{cdAnuncio}")
    public ResponseEntity<Anuncio> excluir(@PathVariable Long cdAnuncio) {
        Anuncio anuncio = this.repository.findById(cdAnuncio)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Anúncio não encontrado."));

        try {
            this.repository.delete(anuncio);
            return ResponseEntity.ok(anuncio);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não foi possível excluir o anúncio.");
        }
    }
}