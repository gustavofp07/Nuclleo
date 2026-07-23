package br.cefetmg.nuclleo.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class InteresseRequestDTO {

    @NotNull(message = "O campo usuario é obrigatório")
    private Long cdUsuario;

    @NotNull(message = "O campo anuncio é obrigatório")
    private Long cdAnuncio;
}
