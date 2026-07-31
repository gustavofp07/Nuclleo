package br.cefetmg.nuclleo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.cefetmg.nuclleo.model.Transacao;

@Repository
public interface TransacaoRepository extends JpaRepository<Transacao, Long> {

    List<Transacao> findByUsuarioCdUsuario(Long cdUsuario);

    List<Transacao> findByAnuncioCdAnuncio(Long cdAnuncio);

}
