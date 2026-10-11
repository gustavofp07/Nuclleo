package br.cefetmg.nuclleo.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefetmg.nuclleo.dto.AnalisarDenunciaRequestDTO;
import br.cefetmg.nuclleo.dto.DenunciaRequestDTO;
import br.cefetmg.nuclleo.dto.NotificacaoDTO;
import br.cefetmg.nuclleo.exception.BusinessException;
import br.cefetmg.nuclleo.exception.ConflictException;
import br.cefetmg.nuclleo.exception.ForbiddenException;
import br.cefetmg.nuclleo.exception.ResourceNotFoundException;
import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.Denuncia;
import br.cefetmg.nuclleo.model.MotivoDenuncia;
import br.cefetmg.nuclleo.model.Perfil;
import br.cefetmg.nuclleo.model.Status;
import br.cefetmg.nuclleo.model.StatusDenuncia;
import br.cefetmg.nuclleo.model.TipoAlvo;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.AnuncioRepository;
import br.cefetmg.nuclleo.repository.DenunciaRepository;
import br.cefetmg.nuclleo.repository.SancaoRepository;
import br.cefetmg.nuclleo.repository.UsuarioRepository;

@Service
public class DenunciaService {

    @Autowired
    private DenunciaRepository denunciaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private AnuncioRepository anuncioRepository;

    @Autowired
    private SancaoRepository sancaoRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // =====================================================================
    // USUÁRIO: fazer uma denúncia
    // =====================================================================

    @Transactional
    public Denuncia inserir(DenunciaRequestDTO dto, String emailDenunciante) {
        Usuario denunciante = usuarioRepository.findByEmail(emailDenunciante)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        if (dto.getMotivo() == MotivoDenuncia.OUTRO
                && (dto.getDescricao() == null || dto.getDescricao().isBlank())) {
            throw new BusinessException("Descreva o problema quando o motivo for OUTRO.");
        }

        Denuncia denuncia = new Denuncia();
        denuncia.setDenunciante(denunciante);
        denuncia.setTipoAlvo(dto.getTipoAlvo());
        denuncia.setMotivo(dto.getMotivo());
        denuncia.setDescricao(dto.getDescricao());
        denuncia.setStatus(StatusDenuncia.PENDENTE);

        if (dto.getTipoAlvo() == TipoAlvo.ANUNCIO) {
            preencherAlvoAnuncio(denuncia, dto.getCdAlvo(), denunciante);
        } else {
            preencherAlvoUsuario(denuncia, dto.getCdAlvo(), denunciante);
        }

        Denuncia denunciaSalva = denunciaRepository.save(denuncia);

        // Avisa em tempo real os administradores conectados (painel de denúncias)
        messagingTemplate.convertAndSend("/topic/admin/denuncias",
                new NotificacaoDTO("NOVA_DENUNCIA", "Nova denúncia recebida.", null));

        return denunciaSalva;
    }

    private void preencherAlvoAnuncio(Denuncia denuncia, Long cdAnuncio, Usuario denunciante) {
        Anuncio anuncio = anuncioRepository.findById(cdAnuncio)
                .orElseThrow(() -> new ResourceNotFoundException("Anúncio não encontrado."));

        if (anuncio.getStatus() == Status.EXCLUIDO) {
            throw new ResourceNotFoundException("Anúncio não encontrado.");
        }

        Usuario dono = anuncio.getUsuarioCria();
        if (dono.getCdUsuario().equals(denunciante.getCdUsuario())) {
            throw new BusinessException("Você não pode denunciar o seu próprio anúncio.");
        }

        boolean jaDenunciou = denunciaRepository.existsByDenunciante_CdUsuarioAndAnuncio_CdAnuncioAndStatus(
                denunciante.getCdUsuario(), cdAnuncio, StatusDenuncia.PENDENTE);
        if (jaDenunciou) {
            throw new ConflictException("Você já denunciou este anúncio. A denúncia está em análise.");
        }

        denuncia.setAnuncio(anuncio);
        denuncia.setUsuarioDenunciado(dono);
        
        denuncia.setSnapshotAnuncio("Nome: " + anuncio.getNmAnuncio()
                + "\nDescrição: " + (anuncio.getDescricao() != null ? anuncio.getDescricao() : ""));
    }

    private void preencherAlvoUsuario(Denuncia denuncia, Long cdUsuario, Usuario denunciante) {
        Usuario denunciado = usuarioRepository.findById(cdUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        if (denunciado.getStatus() == Status.EXCLUIDO) {
            throw new ResourceNotFoundException("Usuário não encontrado.");
        }

        if (denunciado.getCdUsuario().equals(denunciante.getCdUsuario())) {
            throw new BusinessException("Você não pode denunciar a sua própria conta.");
        }

        if (denunciado.getPerfil() == Perfil.ADMINISTRADOR) {
            throw new BusinessException("Não é possível denunciar um administrador.");
        }

        boolean jaDenunciou = denunciaRepository
                .existsByDenunciante_CdUsuarioAndUsuarioDenunciado_CdUsuarioAndTipoAlvoAndStatus(
                        denunciante.getCdUsuario(), cdUsuario, TipoAlvo.USUARIO, StatusDenuncia.PENDENTE);
        if (jaDenunciou) {
            throw new ConflictException("Você já denunciou este usuário. A denúncia está em análise.");
        }

        denuncia.setUsuarioDenunciado(denunciado);
    }

    // =====================================================================
    // ADMINISTRADOR
    // =====================================================================

    @Transactional(readOnly = true)
    public Page<Denuncia> listar(StatusDenuncia status, MotivoDenuncia motivo, TipoAlvo tipoAlvo, Pageable pageable) {
        return denunciaRepository.filtrar(status, motivo, tipoAlvo, pageable);
    }

    @Transactional(readOnly = true)
    public Denuncia buscarPorId(Long cdDenuncia) {
        return denunciaRepository.findById(cdDenuncia)
                .orElseThrow(() -> new ResourceNotFoundException("Denúncia não encontrada."));
    }

    // Todas as denúncias recebidas por um usuário (inclusive as dos anúncios dele)
    @Transactional(readOnly = true)
    public List<Denuncia> listarPorUsuarioDenunciado(Long cdUsuario) {
        return denunciaRepository.findByUsuarioDenunciado_CdUsuarioOrderByDtCriacaoDesc(cdUsuario);
    }

    @Transactional(readOnly = true)
    public List<Denuncia> listarPorAnuncio(Long cdAnuncio) {
        return denunciaRepository.findByAnuncio_CdAnuncioOrderByDtCriacaoDesc(cdAnuncio);
    }

    @Transactional
    public Denuncia analisar(Long cdDenuncia, AnalisarDenunciaRequestDTO dto, String emailAdmin) {
        Usuario admin = buscarAdmin(emailAdmin);
        Denuncia denuncia = buscarPorId(cdDenuncia);

        if (denuncia.getStatus() != StatusDenuncia.PENDENTE) {
            throw new BusinessException("Esta denúncia já foi analisada.");
        }

        if (dto.getStatus() == StatusDenuncia.PENDENTE) {
            throw new BusinessException("O resultado deve ser PROCEDENTE ou IMPROCEDENTE.");
        }

        denuncia.setStatus(dto.getStatus());
        denuncia.setAdminResponsavel(admin);
        denuncia.setDtAnalise(LocalDateTime.now());

        return denunciaRepository.save(denuncia);
    }

    @Transactional
    public void excluir(Long cdDenuncia) {
        Denuncia denuncia = buscarPorId(cdDenuncia);

        // A sanção continua no histórico, só perde a referência à denúncia apagada
        sancaoRepository.findByDenuncia_CdDenuncia(cdDenuncia)
                .forEach(sancao -> sancao.setDenuncia(null));

        denunciaRepository.delete(denuncia);
    }

    private Usuario buscarAdmin(String emailAdmin) {
        Usuario admin = usuarioRepository.findByEmail(emailAdmin)
                .orElseThrow(() -> new ResourceNotFoundException("Administrador não encontrado."));

        if (admin.getPerfil() != Perfil.ADMINISTRADOR) {
            throw new ForbiddenException("Ação permitida somente para administradores.");
        }
        return admin;
    }
}
