package br.cefetmg.nuclleo.dto;

import br.cefetmg.nuclleo.model.MotivoDenuncia;
import br.cefetmg.nuclleo.model.TipoAlvo;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Corpo da denúncia feita por um usuário.
 * O denunciante NÃO vem aqui: ele é obtido do token.
 */
@Getter
@Setter
@NoArgsConstructor
public class DenunciaRequestDTO {

    @NotNull(message = "Informe se a denúncia é de um ANUNCIO ou de um USUARIO.")
    private TipoAlvo tipoAlvo;

    // cdAnuncio quando tipoAlvo = ANUNCIO; cdUsuario quando tipoAlvo = USUARIO
    @NotNull(message = "Informe o código do anúncio ou do usuário denunciado.")
    private Long cdAlvo;

    @NotNull(message = "Informe o motivo da denúncia.")
    private MotivoDenuncia motivo;

    // Obrigatória quando o motivo for OUTRO
    @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres.")
    private String descricao;
}
