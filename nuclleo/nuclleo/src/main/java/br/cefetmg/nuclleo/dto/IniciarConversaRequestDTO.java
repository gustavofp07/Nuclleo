package br.cefetmg.nuclleo.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class IniciarConversaRequestDTO {

    @NotNull(message = "O campo código do usuário solicitante é obrigatório.")
    private Long cdUsuarioSolicitante;
}