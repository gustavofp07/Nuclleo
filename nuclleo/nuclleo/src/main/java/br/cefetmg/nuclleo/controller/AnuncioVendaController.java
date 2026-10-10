package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.cefetmg.nuclleo.exception.BadRequestException;
import br.cefetmg.nuclleo.model.AnuncioVenda;
import br.cefetmg.nuclleo.services.AnuncioVendaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/anuncios/vendas")
@CrossOrigin(origins = "*")
@Tag(name = "Anúncios de Venda", description = "Endpoints para gerenciamento de anúncios de venda")
public class AnuncioVendaController {
    @Autowired
    private AnuncioVendaService anuncioVendaService;

    //não vou colocar o delete aqui, pois o anuncio é delelatdo pelo id, não precisa de um endpoint específico pra isso.
    //O mesmo vale pro put, que é só pra atualizar o anúncio, não tem nada específico pra venda.

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Cadastrar anúncio de venda")
    public ResponseEntity<AnuncioVenda> inserir(
            @Valid @RequestPart("anuncio") AnuncioVenda anuncio,
            @RequestPart(value = "foto", required = false) MultipartFile foto) {
        if (anuncio.getCdAnuncio() != null) { // gambiarra. Tem q tirar isso
            anuncio.setCdAnuncio(null);
        }

        AnuncioVenda objAnuncio = anuncioVendaService.inserir(anuncio, foto);
        return ResponseEntity.status(HttpStatus.CREATED).body(objAnuncio);
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Atualizar anúncio de venda")
    public ResponseEntity<AnuncioVenda> alterar(
            @Valid @RequestPart("anuncio") AnuncioVenda anuncio,
            @RequestPart(value = "foto", required = false) MultipartFile foto,
            Authentication authentication) {
        if (anuncio.getCdAnuncio() == null) {
            throw new BadRequestException("Id é obrigatório");
        }

        AnuncioVenda objAnuncio = anuncioVendaService.alterar(anuncio, foto, authentication.getName());
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
    public ResponseEntity<AnuncioVenda> getAnuncioById(@PathVariable Long cdAnuncio, Authentication authentication) {
        AnuncioVenda anuncio = anuncioVendaService.buscarAnuncioPorId(cdAnuncio, authentication.getName());
        return ResponseEntity.ok(anuncio);
    }

    //retorna os anúncios de venda de um usuário
    @GetMapping("/usuario/{cdUsuario}")
    @Operation(summary = "Listar anúncios de venda por usuário")
    public ResponseEntity<List<AnuncioVenda>> getAnunciosByUsuario(@PathVariable Long cdUsuario, Authentication authentication) {
        List<AnuncioVenda> anuncios = anuncioVendaService.buscarAnunciosPorUsuario(cdUsuario, authentication.getName());
        return ResponseEntity.ok(anuncios);
    }

}
