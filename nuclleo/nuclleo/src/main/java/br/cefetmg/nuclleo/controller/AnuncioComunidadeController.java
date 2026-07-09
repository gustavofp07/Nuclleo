package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
import br.cefetmg.nuclleo.services.AnuncioComunidadeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("api/v1/anuncioComunidade")
@CrossOrigin(origins = "*")
@Tag(name = "Relações anúncio-comunidade", description = "Endpoints para gerenciamento das relações entre anúncios e comunidades")
public class AnuncioComunidadeController {
    @Autowired
    private AnuncioComunidadeService anuncioComunidadeService;

    @PostMapping("")
    @Operation(summary = "Inserir uma nova relação entre anúncio e comunidade")
    public ResponseEntity<AnuncioComunidade> inserir(@Valid @RequestBody AnuncioComunidade anuncioComunidade) {
        anuncioComunidadeService.inserir(anuncioComunidade);
        return ResponseEntity.ok(anuncioComunidade);
    }

    @PostMapping("/relacoes")
    @Operation(summary = "Inserir relações em lote entre anúncio e comunidade")
    public ResponseEntity<List<AnuncioComunidade>> inserirRelacoes(@RequestBody List<AnuncioComunidade> relacoes) {
        List<AnuncioComunidade> relacoesInseridas = anuncioComunidadeService.inserirRelacoes(relacoes);
        return ResponseEntity.ok(relacoesInseridas);
    }

    @GetMapping("/comunidade/anuncios")
    @Operation(summary = "Listar anúncios de uma comunidade")
    public ResponseEntity<List<Anuncio>> listarAnunciosDaComunidade(@RequestParam Long cdComunidade) {
        List<Anuncio> anuncios = anuncioComunidadeService.listarAnunciosDaComunidade(cdComunidade);
        return ResponseEntity.ok(anuncios);
    }

    @GetMapping("")
    @Operation(summary = "Listar todas as relações anúncio-comunidade")
    public ResponseEntity<List<AnuncioComunidade>> listarAnuncioComunidade() {
        List<AnuncioComunidade> relacoes = anuncioComunidadeService.listarAnuncioComunidade();
        return ResponseEntity.ok(relacoes);
    }

    @GetMapping("/anuncio")
    @Operation(summary = "Listar relações por anúncio")
    public ResponseEntity<List<AnuncioComunidade>> listarPorAnuncio(@RequestParam Long cdAnuncio) {
        List<AnuncioComunidade> relacoes = anuncioComunidadeService.listarPorAnuncio(cdAnuncio);
        return ResponseEntity.ok(relacoes);
    }

    @GetMapping("/comunidade")
    @Operation(summary = "Listar relações por comunidade")
    public ResponseEntity<List<AnuncioComunidade>> listarPorComunidade(@RequestParam Long cdComunidade) {
        List<AnuncioComunidade> relacoes = anuncioComunidadeService.listarPorComunidade(cdComunidade);
        return ResponseEntity.ok(relacoes);
    }

    @DeleteMapping("/comunidade")
    @Operation(summary = "Excluir relações por comunidade")
    public ResponseEntity<List<AnuncioComunidade>> excluirPorComunidade(@RequestParam Long cdComunidade) {
        List<AnuncioComunidade> relacoesExcluidas = anuncioComunidadeService.excluirPorComunidade(cdComunidade);
        return ResponseEntity.ok(relacoesExcluidas);
    }

    // URL: DELETE api/v1/AnuncioComunidade/anuncio?cdAnuncio=1
    @DeleteMapping("/anuncio")
    @Operation(summary = "Excluir relações por anúncio")
    public ResponseEntity<List<AnuncioComunidade>> excluirPorAnuncio(@RequestParam Long cdAnuncio) {
        List<AnuncioComunidade> relacoesExcluidas = anuncioComunidadeService.excluirPorAnuncio(cdAnuncio);
        return ResponseEntity.ok(relacoesExcluidas);
    }

    // URL: DELETE api/v1/AnuncioComunidade/relacao?cdAnuncio=1&cdComunidade=2
    // Deleta a relação específica de um anúncio em uma comunidade. Não retorna
    // lista, pois é uma relação específica.
    @DeleteMapping("/relacao")
    @Operation(summary = "Excluir relação específica entre anúncio e comunidade")
    public ResponseEntity<AnuncioComunidade> excluirRelacaoEspecifica(@RequestParam Long cdAnuncio,
            @RequestParam Long cdComunidade) {
        AnuncioComunidade relacaoExcluida = anuncioComunidadeService.excluirRelacaoEspecifica(cdAnuncio, cdComunidade);
        return ResponseEntity.ok(relacaoExcluida);
    }
}
