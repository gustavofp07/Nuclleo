package br.cefetmg.nuclleo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class AvaliarAnuncianteRequestDTO {

    @NotNull(message = "A nota é obrigatória.")
    @Min(value = 1, message = "A nota deve ser no mínimo 1.")
    @Max(value = 5, message = "A nota deve ser no máximo 5.")
    private Integer nota;

    public Integer getNota() { return nota; }
    public void setNota(Integer nota) { this.nota = nota; }
}