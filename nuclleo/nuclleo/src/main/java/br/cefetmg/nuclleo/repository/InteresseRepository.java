package br.cefetmg.nuclleo.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.cefetmg.nuclleo.dto.TotalInteressadosDTO;
import br.cefetmg.nuclleo.model.Interesse;

@Repository
public interface InteresseRepository extends JpaRepository<Interesse, Long>  {

    //List<Interesse> findByUsuarioId(Long id);

    //List<Interesse> findByAnuncioId(Long id);

    List<Interesse> findByUsuarioCdUsuario(Long cdUsuario);

    List<Interesse> findByAnuncioCdAnuncio(Long cdAnuncio);

    List<Interesse> findByAnuncioUsuarioCriaCdUsuario(Long cdUsuario);

    boolean existsByUsuarioCdUsuarioAndAnuncioCdAnuncio(Long cdUsuario, Long cdAnuncio);

    // O usuário é um dos dois lados da conversa (interessado ou dono do anúncio)?
    @Query("""
            select count(i) > 0 from Interesse i
            where i.id = :cdInteresse
              and (i.usuario.cdUsuario = :cdUsuario or i.anuncio.usuarioCria.cdUsuario = :cdUsuario)
            """)
    boolean participaDaConversa(@Param("cdInteresse") Long cdInteresse, @Param("cdUsuario") Long cdUsuario);

    // Pessoas interessadas agora em cada anúncio: conversa finalizada já não conta
    @Query("""
            select new br.cefetmg.nuclleo.dto.TotalInteressadosDTO(i.anuncio.cdAnuncio, count(distinct i.usuario.cdUsuario))
            from Interesse i
            where i.finalizado = false
              and i.anuncio.cdAnuncio in :cdAnuncios
            group by i.anuncio.cdAnuncio
            """)
    List<TotalInteressadosDTO> contarInteressados(@Param("cdAnuncios") Collection<Long> cdAnuncios);

    // Anúncios visíveis da comunidade com mais pessoas interessadas (quem não tem nenhuma fica de fora)
    @Query("""
            select new br.cefetmg.nuclleo.dto.TotalInteressadosDTO(i.anuncio.cdAnuncio, count(distinct i.usuario.cdUsuario))
            from Interesse i
            where i.finalizado = false
              and i.anuncio.status = br.cefetmg.nuclleo.model.Status.ATIVO
              and i.anuncio.usuarioCria.status = br.cefetmg.nuclleo.model.Status.ATIVO
              and exists (
                  select 1 from AnuncioComunidade ac
                  where ac.anuncio.cdAnuncio = i.anuncio.cdAnuncio
                    and ac.comunidade.cdComunidade = :cdComunidade)
            group by i.anuncio.cdAnuncio
            order by count(distinct i.usuario.cdUsuario) desc, i.anuncio.cdAnuncio desc
            """)
    List<TotalInteressadosDTO> rankingDaComunidade(@Param("cdComunidade") Long cdComunidade, Pageable limite);

}
