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

    // Mensagem que esta responde (opcional)
    @ManyToOne
    @JoinColumn(name = "cd_mensagem_resposta")
    private Mensagem respostaA;

    // "Apagar para todos": a linha continua no banco (mantém as respostas e serve de
    // prova numa denúncia), mas o conteúdo deixa de ser enviado para o front.
    // O default evita erro nas linhas que já existem quando a coluna for criada.
    @Column(name = "apagada", nullable = false, columnDefinition = "boolean default false not null")
    private boolean apagada = false;





    @PrePersist
    public void prePersist() {
        //@PrePersist significa: execute isso automaticamente imediatamente antes do INSERT.
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

    public Mensagem getRespostaA() {
        return respostaA;
    }

    public void setRespostaA(Mensagem respostaA) {
        this.respostaA = respostaA;
    }

    public boolean isApagada() {
        return apagada;
    }

    public void setApagada(boolean apagada) {
        this.apagada = apagada;
    }
}