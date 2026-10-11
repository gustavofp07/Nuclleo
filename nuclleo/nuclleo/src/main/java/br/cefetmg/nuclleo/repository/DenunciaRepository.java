package br.cefetmg.nuclleo.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.cefetmg.nuclleo.model.Denuncia;
import br.cefetmg.nuclleo.model.MotivoDenuncia;
import br.cefetmg.nuclleo.model.StatusDenuncia;
import br.cefetmg.nuclleo.model.TipoAlvo;

@Repository
public interface DenunciaRepository extends JpaRepository<Denuncia, Long> {

    // Listagem do painel do admin. Filtro nulo = não filtra por aquele campo.
    @Query("""
                SELECT d
                FROM Denuncia d
                WHERE (:status IS NULL OR d.status = :status)
                  AND (:motivo IS NULL OR d.motivo = :motivo)
                  AND (:tipoAlvo IS NULL OR d.tipoAlvo = :tipoAlvo)
                ORDER BY d.dtCriacao DESC
            """)
    Page<Denuncia> filtrar(
            @Param("status") StatusDenuncia status,
            @Param("motivo") MotivoDenuncia motivo,
            @Param("tipoAlvo") TipoAlvo tipoAlvo,
            Pageable pageable);

    // Todas as denúncias recebidas por um usuário (inclui as dos anúncios dele)
    List<Denuncia> findByUsuarioDenunciado_CdUsuarioOrderByDtCriacaoDesc(Long cdUsuario);

    List<Denuncia> findByAnuncio_CdAnuncioOrderByDtCriacaoDesc(Long cdAnuncio);

    // Denúncias analisadas por um administrador com um certo resultado (perfil do admin)
    List<Denuncia> findByAdminResponsavel_CdUsuarioAndStatusOrderByDtAnaliseDesc(Long cdAdmin, StatusDenuncia status);

    // Evita denúncia repetida enquanto a anterior ainda está pendente
    boolean existsByDenunciante_CdUsuarioAndAnuncio_CdAnuncioAndStatus(
            Long cdDenunciante, Long cdAnuncio, StatusDenuncia status);

    boolean existsByDenunciante_CdUsuarioAndUsuarioDenunciado_CdUsuarioAndTipoAlvoAndStatus(
            Long cdDenunciante, Long cdUsuarioDenunciado, TipoAlvo tipoAlvo, StatusDenuncia status);
}
