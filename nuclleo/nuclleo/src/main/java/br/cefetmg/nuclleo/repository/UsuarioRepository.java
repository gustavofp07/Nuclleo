package br.cefetmg.nuclleo.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.cefetmg.nuclleo.model.Status;
import br.cefetmg.nuclleo.model.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndCdUsuarioNot(String email, Long cdUsuario);

    // usado pela rotina que reativa suspensões vencidas
    List<Usuario> findByStatusAndSuspensoAteLessThanEqual(Status status, LocalDateTime data);
}
