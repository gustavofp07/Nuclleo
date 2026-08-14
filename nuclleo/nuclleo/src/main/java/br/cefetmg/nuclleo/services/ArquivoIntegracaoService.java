package br.cefetmg.nuclleo.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import br.cefetmg.nuclleo.dto.ArquivoResponseDTO;
import br.cefetmg.nuclleo.exception.BusinessException;

@Service
public class ArquivoIntegracaoService {
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public ArquivoIntegracaoService(
            RestClient.Builder builder,
            ObjectMapper objectMapper,
            @Value("${integrations.arquivos.base-url:https://gerenciador-arquivos-7q58.onrender.com}") String baseUrl) {
        this.restClient = builder.baseUrl(baseUrl).build();
        this.objectMapper = objectMapper;
    }

    public ArquivoResponseDTO enviarArquivo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Nenhuma foto foi enviada.");
        }

        String nomeArquivo = file.getOriginalFilename();
        if (nomeArquivo == null || nomeArquivo.isBlank()) {
            throw new BusinessException("Nome da foto inválido.");
        }

        HttpHeaders cabecalhosParte = new HttpHeaders();
        cabecalhosParte.setContentDisposition(ContentDisposition.formData()
                .name("file")
                .filename(nomeArquivo)
                .build());

        if (file.getContentType() != null && !file.getContentType().isBlank()) {
            cabecalhosParte.setContentType(MediaType.parseMediaType(file.getContentType()));
        }

        HttpEntity<?> parteArquivo = new HttpEntity<>(file.getResource(), cabecalhosParte);
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", parteArquivo);

        try {
            ArquivoResponseDTO resposta = restClient.post()
                    .uri("/arquivos")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(ArquivoResponseDTO.class);

            if (resposta == null || resposta.getUrl() == null || resposta.getUrl().isBlank()) {
                throw new BusinessException("A API de arquivos não retornou a URL da foto.");
            }

            return resposta;
        } catch (RestClientResponseException e) {
            throw new BusinessException(extrairMensagem(e));
        } catch (RestClientException e) {
            throw new BusinessException(
                    "Não foi possível conectar à API de arquivos. Tente novamente mais tarde.");
        }
    }

    private String extrairMensagem(RestClientResponseException e) {
        try {
            JsonNode json = objectMapper.readTree(e.getResponseBodyAsString());
            String mensagem = json.path("message").asText();
            if (!mensagem.isBlank()) {
                return mensagem;
            }
        } catch (Exception ignored) {
            // A resposta externa pode não ser JSON.
        }

        return "A API de arquivos recusou a foto (HTTP " + e.getStatusCode().value() + ").";
    }
}
