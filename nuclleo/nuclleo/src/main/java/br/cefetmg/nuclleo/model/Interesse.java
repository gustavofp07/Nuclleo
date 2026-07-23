package br.cefetmg.nuclleo.model;

import java.sql.Date;

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
@Table(name = "interesse",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"cd_usuario", "cd_anuncio"})
    }
)
public class Interesse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "anuncio", nullable = false)
    private Anuncio anuncio;

    @Column(name = "dt_criacao", nullable = false)
    private Date data;

    @Column(name = "ativo")
    private boolean ativo;
}
