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

    public static MensagemDTO of(Mensagem mensagem) {
        MensagemDTO dto = new MensagemDTO();
        dto.id = mensagem.getId();
        dto.cdInteresse = mensagem.getInteresse().getId();
        dto.cdUsuarioRemetente = mensagem.getRemetente().getCdUsuario();
        dto.nomeRemetente = mensagem.getRemetente().getNmUsuario();
        dto.conteudo = mensagem.getConteudo();
        dto.dataEnvio = mensagem.getDataEnvio();
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
}