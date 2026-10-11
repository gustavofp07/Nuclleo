package br.cefetmg.nuclleo.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.cefetmg.nuclleo.dto.AnalisarDenunciaRequestDTO;
import br.cefetmg.nuclleo.model.Denuncia;
import br.cefetmg.nuclleo.dto.DenunciaResponseDTO;
import br.cefetmg.nuclleo.model.MotivoDenuncia;
import br.cefetmg.nuclleo.model.StatusDenuncia;
import br.cefetmg.nuclleo.model.TipoAlvo;
import br.cefetmg.nuclleo.services.DenunciaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin(origins = "*")
@Tag(name = "Admin - Denúncias", description = "Análise de denúncias pelos administradores")
public class AdminDenunciaController {

    @Autowired
    private DenunciaService denunciaService;

    // Ex.: GET
    // /api/v1/admin/denuncias?status=PENDENTE&motivo=GOLPE_FRAUDE&tipoAlvo=ANUNCIO&page=0&size=20
    @GetMapping("/denuncias")
    @Operation(summary = "Listar denúncias (filtros opcionais, paginado, mais recentes primeiro)")
    public ResponseEntity<Page<DenunciaResponseDTO>> listar(
            @RequestParam(required = false) StatusDenuncia status,
            @RequestParam(required = false) MotivoDenuncia motivo,
            @RequestParam(required = false) TipoAlvo tipoAlvo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        int tamanho = Math.min(Math.max(size, 1), 100);
        Page<Denuncia> denuncias = denunciaService.listar(status, motivo, tipoAlvo,
                PageRequest.of(Math.max(page, 0), tamanho));

        Page<DenunciaResponseDTO> denunciasResponse = denuncias.map(DenunciaResponseDTO::new);
        return ResponseEntity.ok(denunciasResponse);
    }

    @GetMapping("/denuncias/{cdDenuncia}")
    @Operation(summary = "Buscar denúncia por id")
    public ResponseEntity<DenunciaResponseDTO> buscarPorId(@PathVariable Long cdDenuncia) {
        DenunciaResponseDTO dtoResponse = new DenunciaResponseDTO(denunciaService.buscarPorId(cdDenuncia));
        return ResponseEntity.ok(dtoResponse);
    }

    // mudar aqui. Fazer um dto de denuncia response
    @GetMapping("/usuarios/{cdUsuario}/denuncias")
    @Operation(summary = "Listar todas as denúncias recebidas por um usuário (inclui as dos anúncios dele)")
    public ResponseEntity<List<DenunciaResponseDTO>> listarPorUsuario(@PathVariable Long cdUsuario) {
        List<Denuncia> denuncias = denunciaService.listarPorUsuarioDenunciado(cdUsuario);
        List<DenunciaResponseDTO> dtoResponse = denuncias.stream().map(DenunciaResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoResponse);
    }

    @GetMapping("/anuncios/{cdAnuncio}/denuncias")
    @Operation(summary = "Listar denúncias de um anúncio")
    public ResponseEntity<List<DenunciaResponseDTO>> listarPorAnuncio(@PathVariable Long cdAnuncio) {
        List<Denuncia> denuncias = denunciaService.listarPorAnuncio(cdAnuncio);
        List<DenunciaResponseDTO> dtoResponse = denuncias.stream().map(DenunciaResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoResponse);
    }

    // ver a necessidade disso aqui
    @PutMapping("/denuncias/{cdDenuncia}/analisar")
    @Operation(summary = "Marcar denúncia como PROCEDENTE ou IMPROCEDENTE")
    public ResponseEntity<DenunciaResponseDTO> analisar(@PathVariable Long cdDenuncia,
            @Valid @RequestBody AnalisarDenunciaRequestDTO dto, Authentication authentication) {
        Denuncia denuncia = denunciaService.analisar(cdDenuncia, dto, authentication.getName());
        DenunciaResponseDTO dtoResponse = new DenunciaResponseDTO(denuncia);
        return ResponseEntity.ok(dtoResponse);
    }

    @DeleteMapping("/denuncias/{cdDenuncia}")
    @Operation(summary = "Apagar denúncia")
    public ResponseEntity<Void> excluir(@PathVariable Long cdDenuncia) {
        denunciaService.excluir(cdDenuncia);
        return ResponseEntity.noContent().build();
    }
}
