package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import br.cefetmg.nuclleo.model.AnuncioRequerimento;
import br.cefetmg.nuclleo.repository.AnuncioRequerimentoRepository;

@RestController
@RequestMapping("/api/v1/anuncios/requerimentos")
@CrossOrigin(origins = "*")
public class AnuncioRequerimentoController {
    private AnuncioRequerimentoRepository repository;

    public AnuncioRequerimentoController(AnuncioRequerimentoRepository repository) {
        this.repository = repository;
    }

    //não vou colocar o delete aqui, pois o anuncio é delelatdo pelo id, não precisa de um endpoint específico pra isso.

    @PostMapping("")
    public AnuncioRequerimento inserir(@RequestBody AnuncioRequerimento anuncio) {
        if (anuncio.getCdAnuncio() != null) { // gambiarra. Tem q tirar isso
            anuncio.setCdAnuncio(null);
        }

        /*
         * java.sql.Date data = new java.sql.Date(System.currentTimeMillis());
         * anuncio.setDtEntrada(data);
         */

        return this.repository.save(anuncio);
    }

    @PutMapping("")
    public AnuncioRequerimento alterar(@RequestBody AnuncioRequerimento anuncio) {
        if (anuncio.getCdAnuncio() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Id é obrigatório");
        }

        return this.repository.save(anuncio);
    }

    @GetMapping("")
    public List<AnuncioRequerimento> getAnuncios() {
        return this.repository.findAll();
    }

    @GetMapping("/{cdAnuncio}")
    public AnuncioRequerimento getAnuncioById(@PathVariable Long cdAnuncio) {

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

    //retorna os anúncios de venda de um usuário
    @GetMapping("/usuario/{cdUsuario}")
    public List<AnuncioRequerimento> getAnunciosByUsuario(@PathVariable Long cdUsuario) {
        return this.repository.findByUsuarioCria_CdUsuario(cdUsuario);
    }

    /*
    @DeleteMapping("/{cdAnuncio}")
    public ResponseEntity<AnuncioRequerimento> excluir(@PathVariable Long cdAnuncio) {
        AnuncioRequerimento anuncio = this.repository.findById(cdAnuncio)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Anúncio não encontrado."));

        try {
            this.repository.delete(anuncio);
            return ResponseEntity.ok(anuncio);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não foi possível excluir o anúncio.");
        }
    }
        */
}
