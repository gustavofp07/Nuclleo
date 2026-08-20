package br.cefetmg.nuclleo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class FinalizarConversaRequestDTO {

    @NotNull(message = "O código do usuário solicitante é obrigatório.")
    private Long cdUsuarioSolicitante;

    private boolean ocorreuTransacao;

    private Double valor;

    @NotNull(message = "A nota do interessado é obrigatória.")
    @Min(value = 1, message = "A nota deve ser no mínimo 1.")
    @Max(value = 5, message = "A nota deve ser no máximo 5.")
    private Integer notaInteressado;

    public Long getCdUsuarioSolicitante() {
        return cdUsuarioSolicitante;
    }

    public void setCdUsuarioSolicitante(Long cdUsuarioSolicitante) {
        this.cdUsuarioSolicitante = cdUsuarioSolicitante;
    }

    public boolean isOcorreuTransacao() {
        return ocorreuTransacao;
    }

    public void setOcorreuTransacao(boolean ocorreuTransacao) {
        this.ocorreuTransacao = ocorreuTransacao;
    }

    public Double getValor() {
        return valor;
    }

    public void setValor(Double valor) {
        this.valor = valor;
    }

    public Integer getNotaInteressado() {
        return notaInteressado;
    }

    public void setNotaInteressado(Integer notaInteressado) {
        this.notaInteressado = notaInteressado;
    }
}