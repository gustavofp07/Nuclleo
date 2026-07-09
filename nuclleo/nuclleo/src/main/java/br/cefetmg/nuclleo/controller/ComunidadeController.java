package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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

import br.cefetmg.nuclleo.model.Comunidade;
import br.cefetmg.nuclleo.services.ComunidadeService;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("api/v1/comunidades")
@CrossOrigin(origins = "*")
@Tag(name = "Comunidades", description = "Endpoints para gerenciamento de comunidades")
public class ComunidadeController {
    @Autowired
    private ComunidadeService comunidadeService;



    /* 
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
    */

    @PostMapping("")
    @Operation(summary = "Cadastrar comunidade")
    public ResponseEntity<Comunidade> inserir(@Valid @RequestBody Comunidade comunidade) {
        comunidade.setCdComunidade(null); //gambiarra

        Comunidade objComunidade = comunidadeService.inserir(comunidade);
        return ResponseEntity.status(HttpStatus.CREATED).body(objComunidade);
    }

    @PutMapping("/{cdComunidade}")
    @Operation(summary = "Atualizar comunidade")
    public ResponseEntity<Comunidade> alterar(@PathVariable Long cdComunidade, @Valid @RequestBody Comunidade comunidade) {

        if (cdComunidade == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Id é obrigatório");
        }

        Comunidade objComunidade = comunidadeService.alterar(cdComunidade, comunidade);
        return ResponseEntity.ok(objComunidade);
    }

    @DeleteMapping("/{cdComunidade}")
    @Operation(summary = "Excluir comunidade")
    public ResponseEntity<Comunidade> excluir(@PathVariable Long cdComunidade) {
        Comunidade objComunidade = comunidadeService.excluir(cdComunidade);
        return ResponseEntity.ok(objComunidade);
    }

    
    @GetMapping("")
    @Operation(summary = "Listar comunidades")
    public ResponseEntity<List<Comunidade>> getComunidades() {
        List<Comunidade> comunidades = comunidadeService.listar();
        return ResponseEntity.ok(comunidades);
    }

    @GetMapping("/{cdComunidade}") // http://localhost:8080/api/v1/comunidades/cdComunidade
    @Operation(summary = "Obter comunidade por id")
    public ResponseEntity<Comunidade> getComunidadeById(@PathVariable Long cdComunidade) {
        if (cdComunidade == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Id é obrigatório");
        }
        
        Comunidade comunidade = comunidadeService.buscarPorId(cdComunidade);
        return ResponseEntity.ok(comunidade);
    }

    @GetMapping("/usuario/{cdUsuario}")
    @Operation(summary = "Obter comunidades por usuário")
    public ResponseEntity<List<Comunidade>> getComunidadesUsuario(@PathVariable Long cdUsuario) {
        if (cdUsuario == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Id é obrigatório");
        }

        List<Comunidade> comunidades = comunidadeService.getComunidadesPorUsuario(cdUsuario);
        return ResponseEntity.ok(comunidades);
    }
}
