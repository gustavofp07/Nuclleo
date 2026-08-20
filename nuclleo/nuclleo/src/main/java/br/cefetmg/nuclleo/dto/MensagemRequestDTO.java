package br.cefetmg.nuclleo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class MensagemRequestDTO {

    @NotNull(message = "O campo código do usuário remetente é obrigatório.")
    private Long cdUsuarioRemetente;

    @NotBlank(message = "O conteúdo da mensagem não pode ser vazio.")
    private String conteudo;

    public Long getCdUsuarioRemetente() {
        return cdUsuarioRemetente;
    }

    public void setCdUsuarioRemetente(Long cdUsuarioRemetente) {
        this.cdUsuarioRemetente = cdUsuarioRemetente;
    }

    public String getConteudo() {
        return conteudo;
    }

    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }
}