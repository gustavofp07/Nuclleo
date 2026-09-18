package br.cefetmg.nuclleo.dto;

public class NotificacaoDTO {

    private String tipo;
    private String mensagem;
    private Long cdInteresse;

    public NotificacaoDTO() {
    }

    public NotificacaoDTO(String tipo, String mensagem, Long cdInteresse) {
        this.tipo = tipo;
        this.mensagem = mensagem;
        this.cdInteresse = cdInteresse;
    }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getMensagem() { return mensagem; }
    public void setMensagem(String mensagem) { this.mensagem = mensagem; }

    public Long getCdInteresse() { return cdInteresse; }
    public void setCdInteresse(Long cdInteresse) { this.cdInteresse = cdInteresse; }
}