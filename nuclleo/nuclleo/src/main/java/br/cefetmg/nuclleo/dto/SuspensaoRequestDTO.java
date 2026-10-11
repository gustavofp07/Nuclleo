package br.cefetmg.nuclleo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SuspensaoRequestDTO {

    // Ignorado quando "permanente" for true. Caso contrário, é obrigatório (validado no service).
    @Min(value = 1, message = "A suspensão deve ser de no mínimo 1 dia.")
    @Max(value = 7, message = "A suspensão deve ser de no máximo 7 dias.")
    private Integer dias;

    // Suspensão sem data de fim (só para contas). Dura até um administrador reativar.
    private boolean permanente;

    // Opcional: denúncia que originou a suspensão. Se informada, ela é marcada como PROCEDENTE.
    private Long cdDenuncia;
}
