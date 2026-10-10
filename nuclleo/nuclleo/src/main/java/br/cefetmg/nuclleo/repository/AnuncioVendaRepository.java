package br.cefetmg.nuclleo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.cefetmg.nuclleo.model.AnuncioVenda;
import br.cefetmg.nuclleo.model.Status;

@Repository
public interface AnuncioVendaRepository extends JpaRepository<AnuncioVenda, Long> {
    List<AnuncioVenda> findByUsuarioCria_CdUsuario(Long cdUsuario);

    // listagem pública: anúncio ativo E dono ativo
    List<AnuncioVenda> findByStatusAndUsuarioCria_Status(Status statusAnuncio, Status statusUsuario);

    List<AnuncioVenda> findByUsuarioCria_CdUsuarioAndStatus(Long cdUsuario, Status status);

    List<AnuncioVenda> findByUsuarioCria_CdUsuarioAndStatusNot(Long cdUsuario, Status status);
}
