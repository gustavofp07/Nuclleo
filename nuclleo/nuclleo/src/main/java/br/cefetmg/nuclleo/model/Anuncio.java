package br.cefetmg.nuclleo.model;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "tb_anuncio")
@Table(name = "tb_anuncio")
@Inheritance(strategy = InheritanceType.JOINED)
public class Anuncio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cd_anuncio", updatable = false)
    private Long cdAnuncio;

    @Column(name = "nm_anuncio", length = 80, nullable = false)
    private String nmAnuncio;

    @Column(name = "descricao", columnDefinition = "TEXT")
    @Size(max = 250, message = "A descrição deve ter no máximo 250 caracteres")
    private String descricao;

    @Column(name = "habilitado", columnDefinition = "boolean DEFAULT true")
    private boolean habilitado = true;

    public enum TipoAnuncio {
        VENDA, REQUERIMENTO
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_anuncio", length = 20, nullable = false)
    private TipoAnuncio tipoAnuncio;

    @Column(name = "dt_criacao", updatable = false)
    private Date dtCriacao;

    @PrePersist
    protected void aoPersistir() {
        this.dtCriacao = new Date();
    }

    @ManyToOne
    @JsonIgnoreProperties({"senha"})
    @JoinColumn(name = "cd_usuario_cria", referencedColumnName = "cd_usuario", foreignKey = @ForeignKey(name = "fk_usuario_criador"))
    private Usuario usuarioCria;
}