package br.cefetmg.nuclleo.model;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity(name = "tb_anuncio_requerimento")
@Table(name = "tb_anuncio_requerimento")
public class AnuncioRequerimento extends Anuncio {

    @Column(name = "ft_anuncio")
    private String ftAnuncio;

    @Column(name = "valor_min", columnDefinition = "DECIMAL(10,2)")
    private BigDecimal valorMin;

    @Column(name = "valor_max", columnDefinition = "DECIMAL(10,2)")
    private BigDecimal valorMax;

    /*
    @Column(name = "valor_min", nullable = false, columnDefinition = "DECIMAL(10,2)")
    private double valorMin;

    @Column(name = "valor_max", nullable = false, columnDefinition = "DECIMAL(10,2)")
    private double valorMax;
    */
}