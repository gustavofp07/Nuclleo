package br.cefetmg.nuclleo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SuspensaoRequestDTO {

    @NotNull(message = "Informe a quantidade de dias da suspensão.")
    @Min(value = 1, message = "A suspensão deve ser de no mínimo 1 dia.")
    @Max(value = 7, message = "A suspensão deve ser de no máximo 7 dias.")
    private Integer dias;

    // Opcional: denúncia que originou a suspensão. Se informada, ela é marcada como PROCEDENTE.
    private Long cdDenuncia;
}
