package br.cefetmg.nuclleo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.cefetmg.nuclleo.model.Interesse;

@Repository
public interface InteresseRepository extends JpaRepository<Interesse, Long>  {

    List<Interesse> findByUsuarioId(Long id);

    List<Interesse> findByAnuncioId(Long id);

}
