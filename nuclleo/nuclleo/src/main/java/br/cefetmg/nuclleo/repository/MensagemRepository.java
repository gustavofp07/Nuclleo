package br.cefetmg.nuclleo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import br.cefetmg.nuclleo.model.Mensagem;

public interface MensagemRepository extends JpaRepository<Mensagem, Long> {

    List<Mensagem> findByInteresseIdOrderByDataEnvioAsc(Long cdInteresse);

    // Apaga todas as mensagens da conversa num único DELETE. Com as respostas
    // apontando para outras mensagens, apagar uma por uma poderia esbarrar na
    // chave estrangeira; num comando só, o banco confere tudo no final.
    @Modifying
    @Query("delete from Mensagem m where m.interesse.id = :cdInteresse")
    void deleteByInteresseId(@Param("cdInteresse") Long cdInteresse);
}