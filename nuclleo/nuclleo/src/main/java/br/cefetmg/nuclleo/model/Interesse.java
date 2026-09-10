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
@Table(name = "interesse", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "cd_usuario", "cd_anuncio" })
})
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

    @Column(name = "finalizado")
    private boolean finalizado;

    @Column(name = "aceito")
    private boolean aceito;

    @Column(name = "conversa_iniciada") // <-- ADICIONADO
    private boolean conversaIniciada;

    @Column(name = "avaliacao_interessado_feita")
    private boolean avaliacaoInteressadoFeita; // anunciante avaliou o interessado

    @Column(name = "avaliacao_anunciante_feita")
    private boolean avaliacaoAnuncianteFeita; // interessado avaliou o anunciante
}