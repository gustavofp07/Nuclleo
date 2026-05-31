package br.cefetmg.nuclleo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.cefetmg.nuclleo.model.AnuncioRequerimento;

@Repository
public interface AnuncioRequerimentoRepository extends JpaRepository<AnuncioRequerimento, Long> {

    List<AnuncioRequerimento> findByUsuarioCria_CdUsuario(Long cdUsuario);

}
