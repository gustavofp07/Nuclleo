package br.cefetmg.nuclleo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * "Fulano está digitando" no chat da comunidade.
 * Quem envia manda só o campo "digitando"; o back preenche o resto
 * com os dados da conexão já autenticada (ninguém se passa por outra pessoa).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DigitandoComunidadeDTO {

    private Long cdUsuario;
    private String nmUsuario;
    private String ftUsuario;
    private boolean digitando;
}
