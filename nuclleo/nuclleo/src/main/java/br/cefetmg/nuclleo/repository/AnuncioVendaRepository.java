package br.cefetmg.nuclleo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.cefetmg.nuclleo.model.AnuncioVenda;

@Repository
public interface AnuncioVendaRepository extends JpaRepository<AnuncioVenda, Long> {
    List<AnuncioVenda> findByUsuarioCria_CdUsuario(Long cdUsuario);
}