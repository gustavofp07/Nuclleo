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

/**
 * Histórico de moderação: cada ação de um administrador sobre uma conta
 * ou um anúncio gera um registro aqui (quem fez, o quê, quando e por quê).
 */
@Data
@NoArgsConstructor
@Entity
@Table(name = "tb_sancao")
public class Sancao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cd_sancao")
    private Long cdSancao;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_alvo", length = 20, nullable = false)
    private TipoAlvo tipoAlvo;

    // Sempre preenchido: o usuário punido, ou o dono do anúncio punido.
    // Assim o histórico de um usuário mostra também as sanções dos anúncios dele.
    @ManyToOne
    @JsonIgnoreProperties({ "senha" })
    @JoinColumn(name = "cd_usuario", nullable = false)
    private Usuario usuario;

    // Preenchido somente quando tipoAlvo = ANUNCIO
    @ManyToOne
    @JoinColumn(name = "cd_anuncio")
    private Anuncio anuncio;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", length = 20, nullable = false)
    private TipoSancao tipo;

    // Quantidade de dias (somente para SUSPENSAO)
    @Column(name = "dias")
    private Integer dias;

    @Column(name = "dt_inicio", nullable = false)
    private LocalDateTime dtInicio;

    // Fim da suspensão (somente para SUSPENSAO)
    @Column(name = "dt_fim")
    private LocalDateTime dtFim;

    @ManyToOne
    @JsonIgnoreProperties({ "senha" })
    @JoinColumn(name = "cd_admin", nullable = false)
    private Usuario admin;

    // Denúncia que originou a sanção (opcional)
    @ManyToOne
    @JsonIgnoreProperties({ "anuncio", "usuarioDenunciado", "denunciante", "adminResponsavel" })
    @JoinColumn(name = "cd_denuncia")
    private Denuncia denuncia;

    @PrePersist
    protected void aoPersistir() {
        if (this.dtInicio == null) {
            this.dtInicio = LocalDateTime.now();
        }
    }
}
