package br.cefetmg.nuclleo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.cefetmg.nuclleo.model.Sancao;

@Repository
public interface SancaoRepository extends JpaRepository<Sancao, Long> {

    // Histórico de um usuário (inclui as sanções dos anúncios dele)
    List<Sancao> findByUsuario_CdUsuarioOrderByDtInicioDesc(Long cdUsuario);

    List<Sancao> findByDenuncia_CdDenuncia(Long cdDenuncia);

    // Sanções aplicadas por um administrador
    List<Sancao> findByAdmin_CdUsuarioOrderByDtInicioDesc(Long cdAdmin);
}
