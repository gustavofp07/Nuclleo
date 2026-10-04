package br.cefetmg.nuclleo.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UsuarioLoginResponseDTO {

    private String token;

    public UsuarioLoginResponseDTO(String token) {
        this.token = token;
    }
}