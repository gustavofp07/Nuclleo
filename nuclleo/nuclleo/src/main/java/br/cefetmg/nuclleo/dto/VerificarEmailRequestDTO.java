package br.cefetmg.nuclleo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class VerificarEmailRequestDTO {

    @NotBlank(message = "O email não pode estar em branco.")
    private String email;

    private Long cdUsuario;
}