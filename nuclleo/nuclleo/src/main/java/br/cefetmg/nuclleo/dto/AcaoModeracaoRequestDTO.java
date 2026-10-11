package br.cefetmg.nuclleo.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Corpo usado para reativar ou excluir (pelo administrador) uma conta ou um anúncio.
 */
@Getter
@Setter
@NoArgsConstructor
public class AcaoModeracaoRequestDTO {

    // Opcional: denúncia que originou a ação. Se informada, ela é marcada como PROCEDENTE.
    private Long cdDenuncia;
}
