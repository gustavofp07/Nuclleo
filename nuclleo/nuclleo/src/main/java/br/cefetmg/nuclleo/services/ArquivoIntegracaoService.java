package br.cefetmg.nuclleo.services;

import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import br.cefetmg.nuclleo.dto.ArquivoResponseDTO;

@Service
public class ArquivoIntegracaoService {
    private final RestClient restClient;

    public ArquivoIntegracaoService(RestClient.Builder builder) {
        this.restClient = builder
                .baseUrl("https://gerenciador-arquivos-7q58.onrender.com")
                .build();
    }

    /*
     * public ArquivoResponseDTO enviarArquivo(MultipartFile file) {
     * 
     * MultipartBodyBuilder body = new MultipartBodyBuilder();
     * body.part("file", file.getResource());
     * 
     * return restClient.post()
     * .uri("/arquivos")
     * .contentType(MediaType.MULTIPART_FORM_DATA)
     * .body(body.build())
     * .retrieve()
     * .body(ArquivoResponseDTO.class);
     * }
     */

    public ArquivoResponseDTO enviarArquivo(MultipartFile file) {

        MultipartBodyBuilder body = new MultipartBodyBuilder();

        var parte = body
                .part("file", file.getResource())
                .filename(file.getOriginalFilename());

        if (file.getContentType() != null) {
            parte.contentType(
                    MediaType.parseMediaType(file.getContentType()));
        }

        return restClient.post()
                .uri("/arquivos")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body.build())
                .retrieve()
                .body(ArquivoResponseDTO.class);
    }
}
