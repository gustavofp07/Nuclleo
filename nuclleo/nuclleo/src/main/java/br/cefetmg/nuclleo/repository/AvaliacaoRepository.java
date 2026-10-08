package br.cefetmg.nuclleo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.cefetmg.nuclleo.model.Avaliacao;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    // Avaliacao findByTransacaoAndAvaliador(Transacao transacao, Usuario
    // avaliador);

    // Busca avaliações pendentes de um usuário (onde ele é o avaliador e nota é
    // null)
    List<Avaliacao> findByAvaliadorCdUsuarioAndNotaIsNull(Long cdUsuario);

    // Busca todas as avaliações de um usuário como avaliado (para ver sua
    // reputação)
    List<Avaliacao> findByAvaliadoCdUsuarioAndNotaIsNotNull(Long cdUsuario);

    // Conta quantas avaliações já feitas o usuário recebeu
    long countByAvaliadoCdUsuarioAndNotaIsNotNull(Long cdUsuario);

    List<Avaliacao> findByAvaliadorCdUsuarioAndAvaliadoCdUsuarioAndNotaIsNull(Long cdAvaliador, Long cdAvaliado);

    // Avaliações já realizadas de um avaliador para um mesmo avaliado
    List<Avaliacao> findByAvaliadorCdUsuarioAndAvaliadoCdUsuarioAndNotaIsNotNull(Long cdAvaliador, Long cdAvaliado);

    // Busca todas as avaliações de uma transação
    List<Avaliacao> findByTransacaoId(Long cdTransacao);

}