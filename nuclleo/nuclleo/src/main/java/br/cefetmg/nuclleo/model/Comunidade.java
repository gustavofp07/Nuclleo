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
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "tb_Comunidade")
public class Comunidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cdComunidade", updatable = false)
    private Long cdComunidade; // existe o tipo UUID

    /*
     * @Id
     * @GeneratedValue
     * @UuidGenerator
     * @Column(name = "cdComunidade", updatable = false)
     * private UUID cdComunidade; // existe o tipo UUID
     */

    @Column(name = "nmComunidade", length = 60, nullable = false)
    private String nmComunidade;

    @Column(name = "dtCriacao")
    private Date dtCriacao;

    @Column(name = "descricao", columnDefinition = "TEXT", nullable = false)
    private String descricao;

    @ManyToOne
    @JsonIgnoreProperties({"senha"})
    @JoinColumn(name = "cdUsuarioCria", referencedColumnName = "cdUsuario", foreignKey = @ForeignKey(name = "fk_usuario_criador"))
    private Usuario usuarioCria;
}
