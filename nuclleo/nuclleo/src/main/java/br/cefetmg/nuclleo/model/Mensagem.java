package br.cefetmg.nuclleo.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "mensagem")
public class Mensagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cd_interesse", nullable = false)
    private Interesse interesse;

    @ManyToOne
    @JoinColumn(name = "cd_usuario_remetente", nullable = false)
    private Usuario remetente;

    @Column(nullable = false, length = 1000)
    private String conteudo;

    @Column(nullable = false)
    private LocalDateTime dataEnvio;

    @PrePersist
    public void prePersist() {
        this.dataEnvio = LocalDateTime.now();
    }

    // getters e setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Interesse getInteresse() {
        return interesse;
    }

    public void setInteresse(Interesse interesse) {
        this.interesse = interesse;
    }

    public Usuario getRemetente() {
        return remetente;
    }

    public void setRemetente(Usuario remetente) {
        this.remetente = remetente;
    }

    public String getConteudo() {
        return conteudo;
    }

    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }

    public LocalDateTime getDataEnvio() {
        return dataEnvio;
    }

    public void setDataEnvio(LocalDateTime dataEnvio) {
        this.dataEnvio = dataEnvio;
    }
}