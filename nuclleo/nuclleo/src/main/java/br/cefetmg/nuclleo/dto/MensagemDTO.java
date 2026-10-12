package br.cefetmg.nuclleo.dto;

import java.time.LocalDateTime;

import br.cefetmg.nuclleo.model.Mensagem;

public class MensagemDTO {

    private Long id;
    private Long cdInteresse;
    private Long cdUsuarioRemetente;
    private String nomeRemetente;
    private String conteudo;
    private LocalDateTime dataEnvio;
    private boolean apagada;

    // Resumo da mensagem respondida (null quando não é resposta)
    private Long cdMensagemResposta;
    private String nomeRemetenteResposta;
    private String conteudoResposta;
    private boolean respostaApagada;

    public static MensagemDTO of(Mensagem mensagem) {
        MensagemDTO dto = new MensagemDTO();
        dto.id = mensagem.getId();
        dto.cdInteresse = mensagem.getInteresse().getId();
        dto.cdUsuarioRemetente = mensagem.getRemetente().getCdUsuario();
        dto.nomeRemetente = mensagem.getRemetente().getNmUsuario();
        dto.dataEnvio = mensagem.getDataEnvio();
        dto.apagada = mensagem.isApagada();
        // O conteúdo de uma mensagem apagada nunca sai do back-end
        dto.conteudo = mensagem.isApagada() ? null : mensagem.getConteudo();

        Mensagem respondida = mensagem.getRespostaA();
        if (respondida != null) {
            dto.cdMensagemResposta = respondida.getId();
            dto.nomeRemetenteResposta = respondida.getRemetente().getNmUsuario();
            dto.respostaApagada = respondida.isApagada();
            dto.conteudoResposta = respondida.isApagada() ? null : respondida.getConteudo();
        }
        return dto;
    }

    // getters e setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCdInteresse() {
        return cdInteresse;
    }

    public void setCdInteresse(Long cdInteresse) {
        this.cdInteresse = cdInteresse;
    }

    public Long getCdUsuarioRemetente() {
        return cdUsuarioRemetente;
    }

    public void setCdUsuarioRemetente(Long cdUsuarioRemetente) {
        this.cdUsuarioRemetente = cdUsuarioRemetente;
    }

    public String getNomeRemetente() {
        return nomeRemetente;
    }

    public void setNomeRemetente(String nomeRemetente) {
        this.nomeRemetente = nomeRemetente;
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

    public boolean isApagada() {
        return apagada;
    }

    public void setApagada(boolean apagada) {
        this.apagada = apagada;
    }

    public Long getCdMensagemResposta() {
        return cdMensagemResposta;
    }

    public void setCdMensagemResposta(Long cdMensagemResposta) {
        this.cdMensagemResposta = cdMensagemResposta;
    }

    public String getNomeRemetenteResposta() {
        return nomeRemetenteResposta;
    }

    public void setNomeRemetenteResposta(String nomeRemetenteResposta) {
        this.nomeRemetenteResposta = nomeRemetenteResposta;
    }

    public String getConteudoResposta() {
        return conteudoResposta;
    }

    public void setConteudoResposta(String conteudoResposta) {
        this.conteudoResposta = conteudoResposta;
    }

    public boolean isRespostaApagada() {
        return respostaApagada;
    }

    public void setRespostaApagada(boolean respostaApagada) {
        this.respostaApagada = respostaApagada;
    }
}