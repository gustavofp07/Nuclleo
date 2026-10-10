package br.cefetmg.nuclleo.dto;

import br.cefetmg.nuclleo.model.StatusDenuncia;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AnalisarDenunciaRequestDTO {

    // PROCEDENTE ou IMPROCEDENTE
    @NotNull(message = "Informe o resultado da análise (PROCEDENTE ou IMPROCEDENTE).")
    private StatusDenuncia status;

    @Size(max = 500, message = "A observação deve ter no máximo 500 caracteres.")
    private String observacao;
}
