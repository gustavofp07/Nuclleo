package br.cefetmg.nuclleo.model;

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
@Table(name = "tb_usuario_comunidade")
public class UsuarioComunidade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Ou uma chave composta

    @ManyToOne
    @JoinColumn(name = "cd_comunidade")
    private Comunidade comunidade;

    @ManyToOne
    @JoinColumn(name = "cd_usuario")
    private Usuario usuario;
}

/*
 * @Column(name = "dt_entrada")
 * private LocalDateTime dtEntrada;
 * 
 * @Column(name = "is_admin")
 * private boolean isAdmin;
 */