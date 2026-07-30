package br.cefetmg.nuclleo.model;

import java.sql.Date;

import org.hibernate.annotations.ManyToAny;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;

@Data
@Entity
@Table(name = "transacao",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"cd_usuario", "cd_anuncio"})
    }
)
public class Transacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "valor", nullable = false)
    private double valor;

    @Column(name = "data", nullable = false)
    private Date data;

    @ManyToOne
    @JoinColumn(name = "cd_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "cd_anuncio", nullable = false)
    private Anuncio anuncio;
}
