package br.cefetmg.nuclleo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Corpo da mensagem enviada no chat da comunidade.
 * O remetente NÃO vem aqui: ele é obtido do token.
 */
@Getter
@Setter
@NoArgsConstructor
public class MensagemComunidadeRequestDTO {

    @NotBlank(message = "O conteúdo da mensagem não pode ser vazio.")
    @Size(max = 500, message = "A mensagem não pode ter mais que 500 caracteres.")
    private String conteudo;

    // Opcional: id da mensagem que está sendo respondida
    private Long cdMensagemResposta;
}
