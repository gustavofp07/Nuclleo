package br.cefetmg.nuclleo.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.cefetmg.nuclleo.model.Comunidade;

@Repository
public interface ComunidadeRepository extends JpaRepository<Comunidade, Long> {} //colocar UUID no lugar de Long

