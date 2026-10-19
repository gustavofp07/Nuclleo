package br.cefetmg.nuclleo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class MensagemRequestDTO {

    // O remetente não vem aqui: é o usuário autenticado na conexão do WebSocket

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

    public String getConteudo() {
        return conteudo;
    }

    public void setConteudo(String conteudo) {
        this.conteudo = conteudo;
    }
}