package br.cefetmg.nuclleo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.data.web.config.EnableSpringDataWebSupport.PageSerializationMode;
import org.springframework.scheduling.annotation.EnableScheduling;

// @EnableScheduling: liga as rotinas com @Scheduled (reativação de suspensões
// vencidas e o heartbeat do SSE das comunidades).
// @EnableSpringDataWebSupport(VIA_DTO): formato estável no JSON das listagens paginadas.
@SpringBootApplication
@EnableScheduling
@EnableSpringDataWebSupport(pageSerializationMode = PageSerializationMode.VIA_DTO)
public class NuclleoApplication {

	public static void main(String[] args) {
		SpringApplication.run(NuclleoApplication.class, args);
	}

}
