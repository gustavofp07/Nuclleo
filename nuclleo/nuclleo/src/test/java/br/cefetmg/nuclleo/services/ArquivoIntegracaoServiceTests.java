package br.cefetmg.nuclleo.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.ObjectMapper;

class ArquivoIntegracaoServiceTests {

    @Test
    void deveEnviarMultipartERetornarUrl() {
        RestClient.Builder builder = RestClient.builder();
        MockRestServiceServer servidor = MockRestServiceServer.bindTo(builder).build();
        ArquivoIntegracaoService service = new ArquivoIntegracaoService(
                builder, new ObjectMapper(), "http://arquivos.test");

        servidor.expect(requestTo("http://arquivos.test/arquivos"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header(HttpHeaders.CONTENT_TYPE,
                        org.hamcrest.Matchers.startsWith(MediaType.MULTIPART_FORM_DATA_VALUE)))
                .andRespond(withSuccess("{\"id\":1,\"url\":\"https://cdn.test/foto.png\"}",
                        MediaType.APPLICATION_JSON));

        MockMultipartFile foto = new MockMultipartFile(
                "foto", "foto.png", MediaType.IMAGE_PNG_VALUE, new byte[] { 1, 2, 3 });

        assertThat(service.enviarArquivo(foto).getUrl())
                .isEqualTo("https://cdn.test/foto.png");
        servidor.verify();
    }
}
