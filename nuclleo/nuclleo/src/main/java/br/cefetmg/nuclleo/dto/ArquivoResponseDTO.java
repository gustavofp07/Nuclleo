package br.cefetmg.nuclleo.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ArquivoResponseDTO {
    private String url;

    public ArquivoResponseDTO(String url) {
        this.url = url;
    }
}
