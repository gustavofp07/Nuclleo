package br.cefetmg.nuclleo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "tb_anuncio")
@Table(name = "tb_anuncio")
@Inheritance(strategy = InheritanceType.JOINED)//configuração para herança
public class Anuncio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cd_anuncio", updatable = false)
    private Long cdAnuncio;

    @Column(name = "nm_anuncio", length = 80, nullable = false)
    private String nmAnuncio;

    @Column(name = "descricao", columnDefinition = "TEXT")
    private String descricao; //tipo TEXT no banco?

    @Column(name = "habilitado", columnDefinition = "TINYINT(1) DEFAULT 1")
    private boolean habilitado = true;

    
    // Criando o Enum dentro da classe (padrão PascalCase para o nome do tipo)
    public enum TipoAnuncio {
        VENDA, REQUERIMENTO
    }

    // Novo atributo mapeado para o MySQL
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_anuncio", length = 20, nullable = false)
    private TipoAnuncio tipoAnuncio;

    @ManyToOne
    @JsonIgnoreProperties({"senha"})
    @JoinColumn(name = "cd_usuario_cria", referencedColumnName = "cd_usuario", foreignKey = @ForeignKey(name = "fk_usuario_criador"))
    private Usuario usuarioCria;
}