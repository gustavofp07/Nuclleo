package br.cefetmg.nuclleo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.cefetmg.nuclleo.model.AnuncioRequerimento;
import br.cefetmg.nuclleo.model.Status;

@Repository
public interface AnuncioRequerimentoRepository extends JpaRepository<AnuncioRequerimento, Long> {

    List<AnuncioRequerimento> findByUsuarioCria_CdUsuario(Long cdUsuario);

    // listagem pública: anúncio ativo E dono ativo
    List<AnuncioRequerimento> findByStatusAndUsuarioCria_Status(Status statusAnuncio, Status statusUsuario);

    List<AnuncioRequerimento> findByUsuarioCria_CdUsuarioAndStatus(Long cdUsuario, Status status);

    List<AnuncioRequerimento> findByUsuarioCria_CdUsuarioAndStatusNot(Long cdUsuario, Status status);
}
