package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import br.cefetmg.nuclleo.dto.AvaliarAnuncianteRequestDTO;
import br.cefetmg.nuclleo.dto.FinalizarConversaRequestDTO;
import br.cefetmg.nuclleo.dto.InteresseRequestDTO;
import br.cefetmg.nuclleo.model.Interesse;
import br.cefetmg.nuclleo.services.InteresseService;
import br.cefetmg.nuclleo.services.UsuarioService;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/interesses")
@CrossOrigin(origins = "*")
@Tag(name = "Interesses", description = "Endpoints para gerenciamento de interesses")
public class InteresseController {
    @Autowired
    private InteresseService interesseService;

    @Autowired
    private UsuarioService usuarioService;

    // Quem pede é sempre o usuário do token, nunca um código vindo da requisição
    private Long cdLogado(Authentication authentication) {
        return usuarioService.buscarPorEmail(authentication.getName()).getCdUsuario();
    }

    @PostMapping("")
    public ResponseEntity<Interesse> inserir(@Valid @RequestBody InteresseRequestDTO dto,
            Authentication authentication) {
        if (dto.getCdAnuncio() == null) {
            throw new IllegalArgumentException("O campo código do anuncio é obrigatório.");
        }

        Interesse interesse = interesseService.inserir(dto, cdLogado(authentication));
        return ResponseEntity.ok(interesse);
    }

    @DeleteMapping("/excluir/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id, Authentication authentication) {
        interesseService.excluir(id, cdLogado(authentication));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/usuario/{id}")
    public ResponseEntity<List<Interesse>> listarPorUsuario(@PathVariable Long id) {
        if (id == null) {
            throw new IllegalArgumentException("O campo id é obrigatório.");
        }

        List<Interesse> interesses = interesseService.listarPorUsuario(id);
        return ResponseEntity.ok(interesses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Interesse> buscarPorId(@PathVariable Long id) {
        if (id == null) {
            throw new IllegalArgumentException("O campo id é obrigatório.");
        }

        Interesse interesse = interesseService.buscarPorId(id);
        return ResponseEntity.ok(interesse);
    }

    @GetMapping("/anuncio/{id}")
    public ResponseEntity<List<Interesse>> listarPorAnuncio(@PathVariable Long id) {
        if (id == null) {
            throw new IllegalArgumentException("O campo id é obrigatório.");
        }

        List<Interesse> interesses = interesseService.listarPorAnuncio(id);
        return ResponseEntity.ok(interesses);
    }

    @GetMapping("/interessados/{cdUsuario}")
    public ResponseEntity<List<Interesse>> listarPorInteressados(@PathVariable Long cdUsuario) {
        if (cdUsuario == null) {
            throw new IllegalArgumentException("O campo código do usuário é obrigatório.");
        }

        List<Interesse> interesses = interesseService.listarPorInteressados(cdUsuario);
        return ResponseEntity.ok(interesses);
    }

    @PutMapping("/{id}/finalizar")
    public ResponseEntity<Void> finalizar(@PathVariable Long id, @Valid @RequestBody FinalizarConversaRequestDTO dto,
            Authentication authentication) {
        interesseService.finalizarConversa(id, cdLogado(authentication), dto);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/aceitar")
    public ResponseEntity<Void> aceitar(@PathVariable Long id, Authentication authentication) {
        interesseService.aceitarInteresse(id, cdLogado(authentication));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/iniciar-conversa") // <-- ADICIONADO
    public ResponseEntity<Void> iniciarConversa(@PathVariable Long id, Authentication authentication) {
        interesseService.iniciarConversa(id, cdLogado(authentication));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/recusar-conversa") // <-- ADICIONADO
    public ResponseEntity<Void> recusarConversa(@PathVariable Long id, Authentication authentication) {
        interesseService.recusarConversa(id, cdLogado(authentication));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/avaliar-anunciante")
    public ResponseEntity<Void> avaliarAnunciante(@PathVariable Long id,
            @Valid @RequestBody AvaliarAnuncianteRequestDTO dto, Authentication authentication) {
        interesseService.avaliarAnunciante(id, cdLogado(authentication), dto);
        return ResponseEntity.noContent().build();
    }
}