package br.cefetmg.nuclleo.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Corpo usado para reativar ou excluir (pelo administrador) uma conta ou um anúncio.
 * Na exclusão o motivo é obrigatório; na reativação é opcional.
 */
@Getter
@Setter
@NoArgsConstructor
public class AcaoModeracaoRequestDTO {

    @Size(max = 500, message = "O motivo deve ter no máximo 500 caracteres.")
    private String motivo;

    // Opcional: denúncia que originou a ação. Se informada, ela é marcada como PROCEDENTE.
    private Long cdDenuncia;
}
