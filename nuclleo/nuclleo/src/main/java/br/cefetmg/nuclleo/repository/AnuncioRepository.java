package br.cefetmg.nuclleo.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.Status;

@Repository
public interface AnuncioRepository extends JpaRepository<Anuncio, Long> {

    // listar os anúncios de um usuário (todos, sem filtro de status - uso interno)
    List<Anuncio> findByUsuarioCria_CdUsuario(Long cdUsuario);

    // listagem pública: anúncio ativo E dono ativo
    List<Anuncio> findByStatusAndUsuarioCria_Status(Status statusAnuncio, Status statusUsuario);

    // anúncios de um usuário com um status específico (ex.: ATIVO para terceiros)
    List<Anuncio> findByUsuarioCria_CdUsuarioAndStatus(Long cdUsuario, Status status);

    // anúncios de um usuário menos os de um status (ex.: o dono vê tudo menos EXCLUIDO)
    List<Anuncio> findByUsuarioCria_CdUsuarioAndStatusNot(Long cdUsuario, Status status);

    // usado pela rotina que reativa suspensões vencidas
    List<Anuncio> findByStatusAndSuspensoAteLessThanEqual(Status status, LocalDateTime data);
}
