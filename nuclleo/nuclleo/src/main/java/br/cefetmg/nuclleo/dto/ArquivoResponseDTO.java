package br.cefetmg.nuclleo.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ArquivoResponseDTO {
    private String url;

    public ArquivoResponseDTO(String url) {
        this.url = url;
    }
}
