package br.cefetmg.nuclleo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.cefetmg.nuclleo.model.Interesse;

@Repository
public interface InteresseRepository extends JpaRepository<Interesse, Long>  {

    //List<Interesse> findByUsuarioId(Long id);

    //List<Interesse> findByAnuncioId(Long id);

    List<Interesse> findByUsuarioCdUsuario(Long cdUsuario);

    List<Interesse> findByAnuncioCdAnuncio(Long cdAnuncio);

    List<Interesse> findByAnuncioUsuarioCriaCdUsuario(Long cdUsuario);

    // O usuário é um dos dois lados da conversa (interessado ou dono do anúncio)?
    @Query("""
            select count(i) > 0 from Interesse i
            where i.id = :cdInteresse
              and (i.usuario.cdUsuario = :cdUsuario or i.anuncio.usuarioCria.cdUsuario = :cdUsuario)
            """)
    boolean participaDaConversa(@Param("cdInteresse") Long cdInteresse, @Param("cdUsuario") Long cdUsuario);

}
