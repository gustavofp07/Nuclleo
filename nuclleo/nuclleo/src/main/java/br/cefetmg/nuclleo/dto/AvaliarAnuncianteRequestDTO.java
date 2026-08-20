package br.cefetmg.nuclleo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class AvaliarAnuncianteRequestDTO {

    @NotNull(message = "O código do usuário solicitante é obrigatório.")
    private Long cdUsuarioSolicitante;

    @NotNull(message = "A nota é obrigatória.")
    @Min(value = 1, message = "A nota deve ser no mínimo 1.")
    @Max(value = 5, message = "A nota deve ser no máximo 5.")
    private Integer nota;

    public Long getCdUsuarioSolicitante() { return cdUsuarioSolicitante; }
    public void setCdUsuarioSolicitante(Long cdUsuarioSolicitante) { this.cdUsuarioSolicitante = cdUsuarioSolicitante; }
    public Integer getNota() { return nota; }
    public void setNota(Integer nota) { this.nota = nota; }
}