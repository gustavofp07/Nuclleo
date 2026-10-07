package br.cefetmg.nuclleo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
    @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres")
    private String senha;
}