package br.cefetmg.nuclleo.dto;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import lombok.Getter;
import lombok.NoArgsConstructor;
import br.cefetmg.nuclleo.model.Denuncia;

@Getter
@NoArgsConstructor 
public class DenunciaResponseDTO {
    private Long cdDenuncia;
    //private Usuario denunciante;
    private Long cdDenunciante;
    private String nomeDenunciante;
    private String tipoAlvo;

    private Long cdAnuncio;
    private String nmAnuncio;
    //private Anuncio anuncio;

    // Sempre preenchido: quando a denúncia é de um anúncio, é o dono do anúncio.
    private Long cdUsuarioDenunciado;
    private String nmUsuarioDenunciado;
    //private Usuario usuarioDenunciado;

    private String motivo;
    //private MotivoDenuncia motivo;

    private String descricao;
    private String snapshotAnuncio;

    private String status;
    //private StatusDenuncia status;

    @Column(name = "dt_criacao", nullable = false, updatable = false)
    private LocalDateTime dtCriacao;

    private Long cdAdminResponsavel;
    private String nmAdminResponsavel;
    //private Usuario adminResponsavel;

    @Column(name = "dt_analise")
    private LocalDateTime dtAnalise;

    public DenunciaResponseDTO(Denuncia denuncia) {
        this.cdDenuncia = denuncia.getCdDenuncia();
        this.cdDenunciante = denuncia.getDenunciante().getCdUsuario();
        this.nomeDenunciante = denuncia.getDenunciante().getNmUsuario();
        this.tipoAlvo = denuncia.getTipoAlvo().name();
        if (denuncia.getAnuncio() != null) {
            this.cdAnuncio = denuncia.getAnuncio().getCdAnuncio();
            this.nmAnuncio = denuncia.getAnuncio().getNmAnuncio();
        }
        this.cdUsuarioDenunciado = denuncia.getUsuarioDenunciado().getCdUsuario();
        this.nmUsuarioDenunciado = denuncia.getUsuarioDenunciado().getNmUsuario();
        this.motivo = denuncia.getMotivo().name();
        this.descricao = denuncia.getDescricao();
        this.snapshotAnuncio = denuncia.getSnapshotAnuncio();
        this.status = denuncia.getStatus().name();
        this.dtCriacao = denuncia.getDtCriacao();
        if (denuncia.getAdminResponsavel() != null) {
            this.cdAdminResponsavel = denuncia.getAdminResponsavel().getCdUsuario();
            this.nmAdminResponsavel = denuncia.getAdminResponsavel().getNmUsuario();
        }
        this.dtAnalise = denuncia.getDtAnalise();
    }
}
