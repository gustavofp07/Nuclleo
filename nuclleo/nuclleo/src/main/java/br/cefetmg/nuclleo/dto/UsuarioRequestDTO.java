package br.cefetmg.nuclleo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UsuarioRequestDTO {
    @NotBlank(message = "O campo nome é obrigatório")
    private String nmUsuario;

    @NotBlank(message = "O campo email é obrigatório")
    private String email;

    @NotBlank(message = "O campo senha é obrigatório")
    private String senha;
}
