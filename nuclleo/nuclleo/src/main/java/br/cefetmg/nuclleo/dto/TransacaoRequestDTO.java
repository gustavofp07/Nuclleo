package br.cefetmg.nuclleo.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransacaoRequestDTO {

    @NotNull(message = "O valor da transação não pode ser nulo.")
    private double valor;

    @NotNull(message = "O ID do usuário não pode ser nulo.")
    private Long cdUsuario;

    @NotNull(message = "O ID do anúncio não pode ser nulo.")
    private Long cdAnuncio; 
}
