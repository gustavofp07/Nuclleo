package br.cefetmg.nuclleo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ComunidadeRequestDTO {
    @NotBlank(message = "O nome da comunidade é obrigatório.")
    private String nmComunidade;

    @NotBlank (message = "A descrição da comunidade é obrigatória.")
    private String descricao;

    @NotBlank(message = "O CEP da comunidade é obrigatório.")
    private String cep;

    @NotNull(message = "O código do usuário que é obrigatório.")
    private Long cdUsuarioCria;
}
