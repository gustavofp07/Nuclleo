package br.cefetmg.nuclleo.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.cefetmg.nuclleo.model.MensagemComunidade;

@Repository
public interface MensagemComunidadeRepository extends JpaRepository<MensagemComunidade, Long> {

    // Histórico paginado: as mais recentes primeiro (o service inverte para exibir)
    List<MensagemComunidade> findByComunidadeCdComunidadeOrderByIdDesc(Long cdComunidade, Pageable pagina);

    List<MensagemComunidade> findByComunidadeCdComunidadeAndIdLessThanOrderByIdDesc(Long cdComunidade,
            Long antesDe, Pageable pagina);

    // Um único DELETE: as respostas apontam para outras mensagens da mesma comunidade
    @Modifying
    @Query("delete from MensagemComunidade m where m.comunidade.cdComunidade = :cdComunidade")
    void deleteByComunidade(@Param("cdComunidade") Long cdComunidade);
}
