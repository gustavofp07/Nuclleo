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

import br.cefetmg.nuclleo.exception.BadRequestException;
import br.cefetmg.nuclleo.model.AnuncioRequerimento;
import br.cefetmg.nuclleo.services.AnuncioRequerimentoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/anuncios/requerimentos")
@CrossOrigin(origins = "*")
@Tag(name = "Anúncios de Requerimento", description = "Endpoints para gerenciamento de anúncios de requerimento")
public class AnuncioRequerimentoController {
    @Autowired
    private AnuncioRequerimentoService anuncioRequerimentoService;

    //não vou colocar o delete aqui, pois o anuncio é delelatdo pelo id, não precisa de um endpoint específico pra isso.

    @PostMapping("")
    @Operation(summary = "Cadastrar anúncio de requerimento")
    public ResponseEntity<AnuncioRequerimento> inserir(@RequestBody AnuncioRequerimento anuncio) {
        if (anuncio.getCdAnuncio() != null) { // gambiarra. Tem q tirar isso
            anuncio.setCdAnuncio(null);
        }

        AnuncioRequerimento objAnuncio = anuncioRequerimentoService.inserir(anuncio);
        return ResponseEntity.status(HttpStatus.CREATED).body(objAnuncio);
    }

    @PutMapping("")
    @Operation(summary = "Atualizar anúncio de requerimento")
    public ResponseEntity<AnuncioRequerimento> alterar(@RequestBody AnuncioRequerimento anuncio) {
        if (anuncio.getCdAnuncio() == null) {
            throw new BadRequestException("Id é obrigatório");
        }

        AnuncioRequerimento objAnuncio = anuncioRequerimentoService.alterar(anuncio);
        return ResponseEntity.ok(objAnuncio);
    }

    @GetMapping("")
    @Operation(summary = "Listar anúncios de requerimento")
    public ResponseEntity<List<AnuncioRequerimento>> getAnuncios() {
        List<AnuncioRequerimento> anuncios = anuncioRequerimentoService.listar();
        return ResponseEntity.ok(anuncios);
    }

    @GetMapping("/{cdAnuncio}")
    @Operation(summary = "Buscar anúncio de requerimento por ID")
    public ResponseEntity<AnuncioRequerimento> getAnuncioById(@PathVariable Long cdAnuncio) {
        if (cdAnuncio == null) {
            throw new BadRequestException("Id é obrigatório");
        }

        AnuncioRequerimento anuncio = anuncioRequerimentoService.buscarAnuncioPorId(cdAnuncio);
        return ResponseEntity.ok(anuncio);
    }

    @GetMapping("/usuario/{cdUsuario}")
    @Operation(summary = "Listar anúncios de requerimento por usuário")
    public ResponseEntity<List<AnuncioRequerimento>> getAnunciosByUsuario(@PathVariable Long cdUsuario) {
        List<AnuncioRequerimento> anuncios = anuncioRequerimentoService.buscarAnunciosPorUsuario(cdUsuario);
        return ResponseEntity.ok(anuncios);
    }

}
