package br.cefetmg.nuclleo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.cefetmg.nuclleo.model.Comunidade;

@Repository
public interface ComunidadeRepository
        extends JpaRepository<Comunidade, Long> {

    List<Comunidade> findByUsuarioCria_CdUsuario(Long cdUsuario);

    boolean existsByCdComunidadeAndUsuarioCria_CdUsuario(Long cdComunidade, Long cdUsuario);

    List<Comunidade> findByCepStartingWith(String inicioCep);

    List<Comunidade> findByNmComunidadeContainingIgnoreCaseOrDescricaoContainingIgnoreCase(String nmComunidade,
            String descricao);
}