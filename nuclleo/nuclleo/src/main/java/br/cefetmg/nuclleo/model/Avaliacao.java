package br.cefetmg.nuclleo.model;

import java.util.Date;

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
@Table(name = "avaliacao",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"cd_avaliador", "cd_transacao"})
    }
)
public class Avaliacao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cdAvaliacao;

    @ManyToOne
    @JoinColumn(name = "cd_transacao", nullable = true)
    private Transacao transacao;

    @ManyToOne
    @JoinColumn(name = "cd_avaliador", nullable = false)
    private Usuario avaliador;

    @ManyToOne
    @JoinColumn(name = "cd_avaliado", nullable = false)
    private Usuario avaliado;

    @Column(name = "nota")
    private Integer nota; // null = pendente, 1-5 = avaliado

    @Column(name = "dt_avaliacao")
    private Date dtAvaliacao;
}