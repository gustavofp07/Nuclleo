package br.cefetmg.nuclleo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.cefetmg.nuclleo.model.UsuarioComunidade;

@Repository
public interface UsuarioComunidadeRepository extends JpaRepository<UsuarioComunidade, Long> {}


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