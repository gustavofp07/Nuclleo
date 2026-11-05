package br.cefetmg.nuclleo.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.AnuncioComunidade;
import jakarta.transaction.Transactional;

import java.util.List;

@Repository
public interface AnuncioComunidadeRepository extends JpaRepository<AnuncioComunidade, Long> {

    // Busca relações filtrando por anuncio
    List<AnuncioComunidade> findByAnuncioCdAnuncio(Long cdAnuncio);

    // Busca relações filtrando por Comunidade
    List<AnuncioComunidade> findByComunidadeCdComunidade(Long cdComunidade);

    // tá errado. deleta e retorna a quantidade deletada, não a lista. Deleta em
    // lote por Comunidade
    // correto:
    /*
     * @Transactional
     * long deleteByComunidadeCdComunidade(Long cdComunidade);
     */

    // Deleta em lote por Comunidade
    @Transactional
    List<AnuncioComunidade> deleteByComunidadeCdComunidade(Long cdComunidade);

    // Deleta em lote por anuncio
    @Transactional
    List<AnuncioComunidade> deleteByAnuncioCdAnuncio(Long cdAnuncio);

    // NOVA FUNÇÃO: Deleta a relação específica de um anúncio em uma comunidade
    @Transactional
    AnuncioComunidade deleteByAnuncioCdAnuncioAndComunidadeCdComunidade(Long cdAnuncio, Long cdComunidade);

    // Quais anúncios do usuário estão publicados em pelo menos uma comunidade
    @Query("""
                SELECT DISTINCT ac.anuncio.cdAnuncio
                FROM AnuncioComunidade ac
                WHERE ac.anuncio.usuarioCria.cdUsuario = :cdUsuario
            """)
    List<Long> findCdAnunciosPublicadosDoUsuario(@Param("cdUsuario") Long cdUsuario);

    // Só traz anúncios ATIVOS cujo dono também está ATIVO, os mais novos primeiro.
    // tipos e busca nunca são nulos: o PostgreSQL não aceita parâmetro nulo em "IS NULL"
    // (sem filtro, vão todos os tipos e o padrão "%%"). Na busca, "!" é o caractere de escape.
    @Query(value = """
                SELECT ac.anuncio
                FROM AnuncioComunidade ac
                WHERE ac.comunidade.cdComunidade = :cdComunidade
                  AND ac.anuncio.status = br.cefetmg.nuclleo.model.Status.ATIVO
                  AND ac.anuncio.usuarioCria.status = br.cefetmg.nuclleo.model.Status.ATIVO
                  AND ac.anuncio.tipoAnuncio IN :tipos
                  AND (LOWER(ac.anuncio.nmAnuncio) LIKE :busca ESCAPE '!'
                       OR LOWER(ac.anuncio.descricao) LIKE :busca ESCAPE '!')
                ORDER BY ac.anuncio.cdAnuncio DESC
            """, countQuery = """
                SELECT COUNT(ac)
                FROM AnuncioComunidade ac
                WHERE ac.comunidade.cdComunidade = :cdComunidade
                  AND ac.anuncio.status = br.cefetmg.nuclleo.model.Status.ATIVO
                  AND ac.anuncio.usuarioCria.status = br.cefetmg.nuclleo.model.Status.ATIVO
                  AND ac.anuncio.tipoAnuncio IN :tipos
                  AND (LOWER(ac.anuncio.nmAnuncio) LIKE :busca ESCAPE '!'
                       OR LOWER(ac.anuncio.descricao) LIKE :busca ESCAPE '!')
            """)
    Page<Anuncio> findAnunciosByComunidade(
            @Param("cdComunidade") Long cdComunidade,
            @Param("tipos") List<Anuncio.TipoAnuncio> tipos,
            @Param("busca") String busca,
            Pageable pagina);
}
