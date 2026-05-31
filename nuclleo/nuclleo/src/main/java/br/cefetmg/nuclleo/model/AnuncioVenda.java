package br.cefetmg.nuclleo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)// Garante que os métodos equals e hashCode considerem os atributos da classe mae
@Entity(name = "tb_anuncio_venda")
public class AnuncioVenda extends Anuncio {

    @Column(name = "ftAnuncio", nullable = false)
    private String ftAnuncio;

    @Column(name = "valor", nullable = false, columnDefinition = "DECIMAL(10,2)")
    private double valor;
}