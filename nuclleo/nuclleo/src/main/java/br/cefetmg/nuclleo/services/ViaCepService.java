package br.cefetmg.nuclleo.services;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import br.cefetmg.nuclleo.dto.ViaCepResponseDTO;
import br.cefetmg.nuclleo.exception.BusinessException;

@Service
public class ViaCepService {

    private final RestClient restClient;

    public ViaCepService(RestClient.Builder builder) {
        this.restClient = builder
                .baseUrl("https://viacep.com.br/ws")
                .build();
    }

    public ViaCepResponseDTO buscarCep(String cep) {

        if (cep == null || cep.isBlank()) {
            throw new BusinessException("CEP é obrigatório.");
        }

        String cepLimpo = cep.replaceAll("\\D", "");

        if (cepLimpo.length() != 8) {
            throw new BusinessException("CEP deve possuir 8 dígitos.");
        }

        try {

            ViaCepResponseDTO resposta = restClient.get()
                    .uri("/{cep}/json/", cepLimpo)
                    .retrieve()
                    .body(ViaCepResponseDTO.class);

            if (resposta == null) {
                throw new BusinessException(
                        "Não foi possível consultar o CEP.");
            }

            if (Boolean.TRUE.equals(resposta.getErro())) {
                throw new BusinessException("CEP não encontrado.");
            }

            return resposta;

        } catch (BusinessException e) {
            throw e;

        } catch (RestClientException e) {
            throw new BusinessException(
                    "Não foi possível consultar o ViaCEP. Tente novamente mais tarde.");
        }
    }
}