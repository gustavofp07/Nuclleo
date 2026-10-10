package br.cefetmg.nuclleo.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "tb_denuncia")
public class Denuncia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cd_denuncia")
    private Long cdDenuncia;

    // Quem fez a denúncia (vem sempre do token, nunca do corpo da requisição)
    @ManyToOne
    @JsonIgnoreProperties({ "senha" })
    @JoinColumn(name = "cd_denunciante", nullable = false)
    private Usuario denunciante;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_alvo", length = 20, nullable = false)
    private TipoAlvo tipoAlvo;

    // Preenchido somente quando tipoAlvo = ANUNCIO
    @ManyToOne
    @JoinColumn(name = "cd_anuncio")
    private Anuncio anuncio;

    // Sempre preenchido: quando a denúncia é de um anúncio, é o dono do anúncio.
    // Assim fica fácil listar todas as denúncias recebidas por um usuário.
    @ManyToOne
    @JsonIgnoreProperties({ "senha" })
    @JoinColumn(name = "cd_usuario_denunciado", nullable = false)
    private Usuario usuarioDenunciado;

    @Enumerated(EnumType.STRING)
    @Column(name = "motivo", length = 30, nullable = false)
    private MotivoDenuncia motivo;

    @Column(name = "descricao", length = 500)
    private String descricao;

    // Cópia do nome e da descrição do anúncio no momento da denúncia,
    // pois o dono pode editar o anúncio depois.
    @Column(name = "snapshot_anuncio", columnDefinition = "TEXT")
    private String snapshotAnuncio;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private StatusDenuncia status;

    @Column(name = "dt_criacao", nullable = false, updatable = false)
    private LocalDateTime dtCriacao;

    // Campos preenchidos quando um administrador analisa a denúncia
    @ManyToOne
    @JsonIgnoreProperties({ "senha" })
    @JoinColumn(name = "cd_admin_responsavel")
    private Usuario adminResponsavel;

    @Column(name = "observacao_admin", length = 500)
    private String observacaoAdmin;

    @Column(name = "dt_analise")
    private LocalDateTime dtAnalise;

    @PrePersist
    protected void aoPersistir() {
        this.dtCriacao = LocalDateTime.now();
        if (this.status == null) {
            this.status = StatusDenuncia.PENDENTE;
        }
    }
}
