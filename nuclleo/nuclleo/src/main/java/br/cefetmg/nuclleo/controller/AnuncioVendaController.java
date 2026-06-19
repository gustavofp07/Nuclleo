package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import br.cefetmg.nuclleo.services.AnuncioVendaService;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/api/v1/anuncios/vendas")
@CrossOrigin(origins = "*")
public class AnuncioVendaController {
    @Autowired
    private AnuncioVendaService anuncioVendaService;

    //não vou colocar o delete aqui, pois o anuncio é delelatdo pelo id, não precisa de um endpoint específico pra isso.
    //O mesmo vale pro put, que é só pra atualizar o anúncio, não tem nada específico pra venda.

    @PostMapping("")
    @Operation(summary = "Cadastrar anúncio de venda")
    public ResponseEntity<AnuncioVenda> inserir(@RequestBody AnuncioVenda anuncio) {
        if (anuncio.getCdAnuncio() != null) { // gambiarra. Tem q tirar isso
            anuncio.setCdAnuncio(null);
        }

        AnuncioVenda objAnuncio = anuncioVendaService.inserir(anuncio);
        return ResponseEntity.status(HttpStatus.CREATED).body(objAnuncio);
    }

    @PutMapping("")
    @Operation(summary = "Atualizar anúncio de venda")
    public ResponseEntity<AnuncioVenda> alterar(@RequestBody AnuncioVenda anuncio) {
        if (anuncio.getCdAnuncio() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Id é obrigatório");
        }

        AnuncioVenda objAnuncio = anuncioVendaService.alterar(anuncio);
        return ResponseEntity.ok(objAnuncio);
    }

    @GetMapping("")
    @Operation(summary = "Listar todos os anúncios de venda")
    public ResponseEntity<List<AnuncioVenda>> getAnuncios() {
        List<AnuncioVenda> anuncios = anuncioVendaService.listar();
        return ResponseEntity.ok(anuncios);
    }

    @GetMapping("/{cdAnuncio}")
    @Operation(summary = "Obter anúncio de venda por ID")
    public ResponseEntity<AnuncioVenda> getAnuncioById(@PathVariable Long cdAnuncio) {
        AnuncioVenda anuncio = anuncioVendaService.buscarAnuncioPorId(cdAnuncio);
        return ResponseEntity.ok(anuncio);
    }

    //retorna os anúncios de venda de um usuário
    @GetMapping("/usuario/{cdUsuario}")
    @Operation(summary = "Listar anúncios de venda por usuário")
    public ResponseEntity<List<AnuncioVenda>> getAnunciosByUsuario(@PathVariable Long cdUsuario) {
        List<AnuncioVenda> anuncios = anuncioVendaService.buscarAnunciosPorUsuario(cdUsuario);
        return ResponseEntity.ok(anuncios);
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
