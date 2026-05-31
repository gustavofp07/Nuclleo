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

import br.cefetmg.nuclleo.model.AnuncioVenda;
import br.cefetmg.nuclleo.repository.AnuncioVendaRepository;

@RestController
@RequestMapping("/api/v1/anuncios/vendas")
@CrossOrigin(origins = "*")
public class AnuncioVendaController {
    private AnuncioVendaRepository repository;

    public AnuncioVendaController(AnuncioVendaRepository repository) {
        this.repository = repository;
    }

    //não vou colocar o delete aqui, pois o anuncio é delelatdo pelo id, não precisa de um endpoint específico pra isso.
    //O mesmo vale pro put, que é só pra atualizar o anúncio, não tem nada específico pra venda.

    @PostMapping("")
    public AnuncioVenda inserir(@RequestBody AnuncioVenda anuncio) {
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
    public AnuncioVenda alterar(@RequestBody AnuncioVenda anuncio) {
        if (anuncio.getCdAnuncio() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Id é obrigatório");
        }

        return this.repository.save(anuncio);
    }

    @GetMapping("")
    public List<AnuncioVenda> getAnuncios() {
        return this.repository.findAll();
    }

    @GetMapping("/{cdAnuncio}")
    public AnuncioVenda getAnuncioById(@PathVariable Long cdAnuncio) {

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
    public List<AnuncioVenda> getAnunciosByUsuario(@PathVariable Long cdUsuario) {
        return this.repository.findByUsuarioCria_CdUsuario(cdUsuario);
    }

    /*
    @DeleteMapping("/{cdAnuncio}")
    public ResponseEntity<AnuncioVenda> excluir(@PathVariable Long cdAnuncio) {
        AnuncioVenda anuncio = this.repository.findById(cdAnuncio)
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
