package br.cefetmg.nuclleo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "avaliacao")
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cdAvaliacao;

    @Column(name = "nota", nullable = false)
    private int nota;
    
    @ManyToOne
    @JoinColumn(name = "cd_transacao", nullable = false)
    private Transacao transacao;

    @ManyToOne
    @JoinColumn(name = "cd_usuario_avaliado", nullable = false)
    private Usuario usuarioAvaliado;

    //vou ter que estudar a lógica de avaliação, mas por enquanto vou deixar assim
}
