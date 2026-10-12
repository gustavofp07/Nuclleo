package br.cefetmg.nuclleo.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

/**
 * Mensagem do chat em grupo de uma comunidade.
 * Segue o mesmo modelo do chat privado (Mensagem): resposta opcional e
 * "apagar para todos" por exclusão lógica.
 */
@Entity
@Table(name = "tb_mensagem_comunidade")
public class MensagemComunidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cd_comunidade", nullable = false)
    private Comunidade comunidade;

    @ManyToOne
    @JoinColumn(name = "cd_usuario_remetente", nullable = false)
    private Usuario remetente;

    @Column(nullable = false, length = 1000)
    private String conteudo;

    @Column(name = "data_envio", nullable = false)
    private LocalDateTime dataEnvio;

    // Mensagem que esta responde (opcional)
    @ManyToOne
    @JoinColumn(name = "cd_mensagem_resposta")
    private MensagemComunidade respostaA;

    @Column(name = "apagada", nullable = false, columnDefinition = "boolean default false not null")
    private boolean apagada = false;

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

    public Comunidade getComunidade() {
        return comunidade;
    }

    public void setComunidade(Comunidade comunidade) {
        this.comunidade = comunidade;
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

    public MensagemComunidade getRespostaA() {
        return respostaA;
    }

    public void setRespostaA(MensagemComunidade respostaA) {
        this.respostaA = respostaA;
    }

    public boolean isApagada() {
        return apagada;
    }

    public void setApagada(boolean apagada) {
        this.apagada = apagada;
    }
}
