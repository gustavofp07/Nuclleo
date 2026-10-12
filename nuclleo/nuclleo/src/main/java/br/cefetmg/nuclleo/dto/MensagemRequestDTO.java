package br.cefetmg.nuclleo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class MensagemRequestDTO {

    @NotNull(message = "O campo código do usuário remetente é obrigatório.")
    private Long cdUsuarioRemetente;

    @NotBlank(message = "O conteúdo da mensagem não pode ser vazio.")
    @Size(max = 500, message = "A mensagem não pode ter mais que 500 caracteres.")
    private String conteudo;

    // Opcional: id da mensagem que está sendo respondida
    private Long cdMensagemResposta;

    public Long getCdMensagemResposta() {
        return cdMensagemResposta;
    }

    public void setCdMensagemResposta(Long cdMensagemResposta) {
        this.cdMensagemResposta = cdMensagemResposta;
    }

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