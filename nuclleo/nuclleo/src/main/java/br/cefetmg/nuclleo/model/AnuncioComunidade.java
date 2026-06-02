package br.cefetmg.nuclleo.model;

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
@Table(name = "tb_anuncio_comunidade",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"cd_anuncio", "cd_comunidade"})
    }
)
public class AnuncioComunidade {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cd_anuncio")
    private Anuncio anuncio;

    @ManyToOne
    @JoinColumn(name = "cd_comunidade")
    private Comunidade comunidade;
    
    /*
    @NotNull(message = "O anúncio é obrigatório.")
    @ManyToOne
    @JoinColumn(name = "cd_anuncio")
    private Anuncio anuncio;
     
    @NotNull(message = "A comunidade é obrigatória.")
    @ManyToOne
    @JoinColumn(name = "cd_comunidade")
    private Comunidade comunidade;
    */
}