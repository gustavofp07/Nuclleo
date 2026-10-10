package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
 
import br.cefetmg.nuclleo.exception.BadRequestException;
import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.services.AnuncioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/anuncios")
@CrossOrigin(origins = "*")
@Tag(name = "Anúncios", description = "Endpoints para gerenciamento de anúncios")
public class AnuncioController {
    @Autowired
    private AnuncioService anuncioService;

    /* 
    // o post e o put não sei se são necessários, acredito que vale mais a pena
    // criar um endpoint específico para cada tipo de anúncio.

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
            throw new BadRequestException("Id é obrigatório");
        }
        return this.repository.save(anuncio);
    }
    */

    @GetMapping("")
    @Operation(summary = "Listar todos os anúncios")
    public ResponseEntity<List<Anuncio>> getAnuncios() {
        List<Anuncio> anuncios = anuncioService.listar();
        return ResponseEntity.ok(anuncios);
    }

    @GetMapping("/{cdAnuncio}")     
    @Operation(summary = "Buscar anúncio por id")
    public ResponseEntity<Anuncio> getAnuncioById(@PathVariable Long cdAnuncio, Authentication authentication) {
        if (cdAnuncio == null) {
            throw new BadRequestException("Id é obrigatório");
        }

        Anuncio objAnuncio = anuncioService.buscarVisivel(cdAnuncio, authentication.getName());
        return ResponseEntity.ok(objAnuncio);
    }

    @GetMapping("/usuario/{cdUsuario}")
    @Operation(summary = "Listar anúncios de um usuário")
    public ResponseEntity<List<Anuncio>> getAnunciosByUsuario(@PathVariable Long cdUsuario, Authentication authentication) {
        List<Anuncio> anuncios = anuncioService.listarAnunciosPorUsuario(cdUsuario, authentication.getName());
        return ResponseEntity.ok(anuncios);
    }

    @DeleteMapping("/{cdAnuncio}")
    @Operation(summary = "Excluir anúncio (exclusão lógica, somente o dono)")
    public ResponseEntity<Anuncio> excluir(@PathVariable Long cdAnuncio, Authentication authentication) {
        Anuncio anuncio = anuncioService.excluir(cdAnuncio, authentication.getName());
        return ResponseEntity.ok(anuncio);
    }
}