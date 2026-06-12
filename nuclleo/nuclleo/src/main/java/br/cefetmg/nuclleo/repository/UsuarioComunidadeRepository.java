package br.cefetmg.nuclleo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.cefetmg.nuclleo.model.UsuarioComunidade;
import jakarta.transaction.Transactional;

@Repository
public interface UsuarioComunidadeRepository extends JpaRepository<UsuarioComunidade, Long> {

    // Busca relações filtrando por Usuário
    List<UsuarioComunidade> findByUsuarioCdUsuario(Long cdUsuario);

    // Busca relações filtrando por Comunidade
    List<UsuarioComunidade> findByComunidadeCdComunidade(Long cdComunidade);

    // Deleta em lote por Comunidade
    @Transactional
    List<UsuarioComunidade> deleteByComunidadeCdComunidade(Long cdComunidade);
    
    // Deleta em lote por Usuário
    @Transactional
    List<UsuarioComunidade> deleteByUsuarioCdUsuario(Long cdUsuario);

    // NOVA FUNÇÃO: Deleta a relação específica de um usuário em uma comunidade
    @Transactional
    List<UsuarioComunidade> deleteByUsuarioCdUsuarioAndComunidadeCdComunidade(Long cdUsuario, Long cdComunidade);
    
    boolean existsByUsuarioCdUsuarioAndComunidadeCdComunidade(Long cdUsuario, Long cdComunidade);
}


/* 
//possui funções proprias
@Repository
public interface UsuarioComunidadeRepository extends JpaRepository<UsuarioComunidade, Long> {

    // Busca todos os membros que pertencem a uma comunidade específica
    List<UsuarioComunidade> findByComunidadeCdComunidade(Long cdComunidade);

    // Busca todas as comunidades às quais um usuário específico está vinculado
    List<UsuarioComunidade> findByUsuarioCdUsuario(Long cdUsuario);

    // Encontra um vínculo específico para checar se o usuário já faz parte daquela comunidade
    Optional<UsuarioComunidade> findByComunidadeCdComunidadeAndUsuarioCdUsuario(Long cdComunidade, Long cdUsuario);

    // Remove o vínculo direto sem precisar buscar o ID da tabela do meio primeiro
    void deleteByComunidadeCdComunidadeAndUsuarioCdUsuario(Long cdComunidade, Long cdUsuario);
}
    */