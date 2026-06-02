package br.cefetmg.nuclleo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

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
    List<AnuncioComunidade> deleteByAnuncioCdAnuncioAndComunidadeCdComunidade(Long cdAnuncio, Long cdComunidade);
}
