package br.cefetmg.nuclleo.model;

import java.sql.Date;

//import java.util.UUID;
//import org.hibernate.annotations.UuidGenerator;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Table;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "tb_comunidade")
@Table(name = "tb_comunidade")
public class Comunidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cd_comunidade", updatable = false)
    private Long cdComunidade; // existe o tipo UUID

    /*
     * @Id
     * @GeneratedValue
     * @UuidGenerator
     * @Column(name = "cdComunidade", updatable = false)
     * private UUID cdComunidade; // existe o tipo UUID
     */

    @Column(name = "nm_comunidade", length = 60, nullable = false)
    private String nmComunidade;

    @Column(name = "dt_criacao")
    private Date dtCriacao;

    @Column(name = "descricao", columnDefinition = "TEXT", nullable = false)
    private String descricao;

    @Column(name = "foto", length = 1000)
    private String foto;

    @ManyToOne
    @JsonIgnoreProperties({"senha"})
    @JoinColumn(name = "cd_usuario_cria", referencedColumnName = "cd_usuario", foreignKey = @ForeignKey(name = "fk_usuario_criador"))
    private Usuario usuarioCria;
}
