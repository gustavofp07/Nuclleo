package br.cefetmg.nuclleo.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * O Hibernate cria um CHECK com os valores do enum Status na coluna tb_anuncio.status,
 * e o ddl-auto: update não atualiza esse CHECK quando o enum ganha um valor novo.
 * Sem isso, desativar um anúncio (status INATIVO) falharia nos bancos que têm esse CHECK antigo.
 */
@Component
public class MigracaoStatusAnuncio implements ApplicationRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        jdbcTemplate.execute("ALTER TABLE tb_anuncio DROP CONSTRAINT IF EXISTS tb_anuncio_status_check");
    }
}
