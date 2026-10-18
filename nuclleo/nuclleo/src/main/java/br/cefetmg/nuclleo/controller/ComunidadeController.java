package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.cefetmg.nuclleo.dto.ComunidadeRequestDTO;
import br.cefetmg.nuclleo.exception.BadRequestException;
import br.cefetmg.nuclleo.model.Comunidade;
import br.cefetmg.nuclleo.services.ComunidadeService;
import br.cefetmg.nuclleo.services.UsuarioService;

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

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Cadastrar comunidade")
    public ResponseEntity<Comunidade> inserir(@Valid @RequestPart("comunidade") ComunidadeRequestDTO dto,
            @RequestPart(value = "foto", required = false) MultipartFile foto,
            Authentication authentication) {

        // Só cria comunidade quem tem o cadastro completo, e sempre em nome de quem está logado
        dto.setCdUsuarioCria(usuarioService.exigirCadastroCompleto(authentication.getName()).getCdUsuario());

        Comunidade objComunidade = comunidadeService.inserir(dto, foto);
        return ResponseEntity.status(HttpStatus.CREATED).body(objComunidade);
    }

    @PutMapping(value = "/{cdComunidade}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Atualizar comunidade")
    public ResponseEntity<Comunidade> alterar(
            @PathVariable Long cdComunidade,
            @Valid @RequestPart("comunidade") Comunidade comunidade,
            @RequestPart(value = "foto", required = false) MultipartFile foto) {

        if (cdComunidade == null) {
            throw new BadRequestException("Id é obrigatório");
        }

        Comunidade objComunidade = comunidadeService.alterar(cdComunidade, comunidade, foto);
        return ResponseEntity.ok(objComunidade);
    }

    @DeleteMapping("/{cdComunidade}")
    @Operation(summary = "Excluir comunidade")
    public ResponseEntity<Comunidade> excluir(@PathVariable Long cdComunidade) {
        Comunidade objComunidade = comunidadeService.excluir(cdComunidade);
        return ResponseEntity.ok(objComunidade);
    }

    @GetMapping("")
    public ResponseEntity<List<Comunidade>> listar(@RequestParam(required = false) String termo) {
        return ResponseEntity.ok(comunidadeService.listar(termo));
    }

    @GetMapping("/{cdComunidade}") // http://localhost:8080/api/v1/comunidades/cdComunidade
    @Operation(summary = "Obter comunidade por id")
    public ResponseEntity<Comunidade> getComunidadeById(@PathVariable Long cdComunidade) {
        if (cdComunidade == null) {
            throw new BadRequestException("Id é obrigatório");
        }

        Comunidade comunidade = comunidadeService.buscarPorId(cdComunidade);
        return ResponseEntity.ok(comunidade);
    }

    @GetMapping("/usuario/{cdUsuario}")
    @Operation(summary = "Obter comunidades por usuário")
    public ResponseEntity<List<Comunidade>> getComunidadesUsuario(@PathVariable Long cdUsuario) {
        if (cdUsuario == null) {
            throw new BadRequestException("Id é obrigatório");
        }

        List<Comunidade> comunidades = comunidadeService.getComunidadesPorUsuario(cdUsuario);
        return ResponseEntity.ok(comunidades);
    }

    /*
     * @GetMapping("/proximas/{cdUsuario}")
     * 
     * @Operation(summary = "Listar comunidades próximas ao usuário")
     * public ResponseEntity<List<Comunidade>>
     * listarComunidadesProximas(@PathVariable Long cdUsuario) {
     * 
     * List<Comunidade> comunidades =
     * comunidadeService.listarComunidadesProximas(cdUsuario);
     * 
     * return ResponseEntity.ok(comunidades);
     * }
     */
    @GetMapping("/proximas/{cdUsuario}")
    public ResponseEntity<List<Comunidade>> listarComunidadesProximas(
            @PathVariable Long cdUsuario,
            @RequestParam(required = false) String termo) {

        return ResponseEntity.ok(comunidadeService.listarComunidadesProximas(cdUsuario, termo));
    }

    // Avisa em tempo real o membro expulso (o vínculo é apagado pelo endpoint de usuário-comunidade)
    @PostMapping("/{cdComunidade}/usuarios/{cdUsuario}/expulsar")
    @Operation(summary = "Expulsar membro da comunidade (avisa o membro em tempo real)")
    public ResponseEntity<Void> expulsarMembro(
            @PathVariable Long cdComunidade,
            @PathVariable Long cdUsuario,
            @RequestParam Long cdAdmin) {

        comunidadeService.expulsarMembro(cdComunidade, cdUsuario, cdAdmin);
        return ResponseEntity.noContent().build();
    }
}