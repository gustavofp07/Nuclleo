package br.cefetmg.nuclleo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefetmg.nuclleo.model.Avaliacao;
import br.cefetmg.nuclleo.model.Transacao;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.AvaliacaoRepository;

@Service
public class AvaliacaoService {
    @Autowired
    private AvaliacaoRepository avaliacaoRepository;

    // Chamado pelo TransacaoService ao criar uma transação
    @Transactional
    public List<Avaliacao> criarAvaliacoesPendentes(Transacao transacao) {
        return criarPar(transacao.getUsuario(), transacao.getAnuncio().getUsuarioCria(), transacao);
    }

    // Chamado quando a conversa é finalizada SEM transação
    @Transactional
    public List<Avaliacao> criarAvaliacoesPendentes(Usuario user1, Usuario user2) {
        return criarPar(user1, user2, null);
    }

    private List<Avaliacao> criarPar(Usuario user1, Usuario user2, Transacao transacao) {
        Avaliacao avaliacao1 = new Avaliacao();
        avaliacao1.setTransacao(transacao);
        avaliacao1.setAvaliador(user1);
        avaliacao1.setAvaliado(user2);
        avaliacao1.setNota(null);
        avaliacao1.setDtAvaliacao(null);
        avaliacaoRepository.save(avaliacao1);

        Avaliacao avaliacao2 = new Avaliacao();
        avaliacao2.setTransacao(transacao);
        avaliacao2.setAvaliador(user2);
        avaliacao2.setAvaliado(user1);
        avaliacao2.setNota(null);
        avaliacao2.setDtAvaliacao(null);
        avaliacaoRepository.save(avaliacao2);

        return java.util.List.of(avaliacao1, avaliacao2);
    }

    // Registra a nota de uma avaliação pendente
    @Transactional
    public Avaliacao avaliar(Long cdAvaliacao, Long cdAvaliador, Integer nota) {

        if (nota < 1 || nota > 5) {
            throw new IllegalArgumentException("A nota deve ser entre 1 e 5.");
        }

        Avaliacao avaliacao = avaliacaoRepository.findById(cdAvaliacao)
                .orElseThrow(() -> new RuntimeException("Avaliação não encontrada. Id: " + cdAvaliacao));

        if (!avaliacao.getAvaliador().getCdUsuario().equals(cdAvaliador)) {
            throw new IllegalArgumentException("Você não tem permissão para realizar esta avaliação.");
        }

        // estava pensando em colocar um atributo boolean "avaliada" na entidade
        // Avaliacao.
        if (avaliacao.getNota() != null) {
            throw new IllegalArgumentException("Esta avaliação já foi realizada.");
        }

        // A nova avaliação sobrepõe as anteriores do mesmo avaliador para o mesmo
        // avaliado: remove as já realizadas para não acumular no total/média.
        List<Avaliacao> anteriores = avaliacaoRepository
                .findByAvaliadorCdUsuarioAndAvaliadoCdUsuarioAndNotaIsNotNull(
                        cdAvaliador, avaliacao.getAvaliado().getCdUsuario());
        avaliacaoRepository.deleteAll(anteriores);

        avaliacao.setNota(nota);
        avaliacao.setDtAvaliacao(new java.sql.Date(System.currentTimeMillis()));

        return avaliacaoRepository.save(avaliacao);
    }

    // Lista avaliações pendentes de um usuário
    @Transactional(readOnly = true)
    public List<Avaliacao> listarPendentes(Long cdUsuario) {
        return avaliacaoRepository.findByAvaliadorCdUsuarioAndNotaIsNull(cdUsuario);
    }

    // Lista avaliações recebidas por um usuário (reputação)
    @Transactional(readOnly = true)
    public List<Avaliacao> listarRecebidas(Long cdUsuario) {
        return avaliacaoRepository.findByAvaliadoCdUsuarioAndNotaIsNotNull(cdUsuario);
    }

    @Transactional(readOnly = true)
    public Float calcularAvaliacao(Long cdUsuario) {
        List<Avaliacao> avaliacoes = avaliacaoRepository.findByAvaliadoCdUsuarioAndNotaIsNotNull(cdUsuario);
        if (avaliacoes.isEmpty()) {
            return null; // ou 0.0f, dependendo de como você quer tratar usuários sem avaliações
        }
        float soma = 0;
        for (Avaliacao avaliacao : avaliacoes) {
            soma += avaliacao.getNota();
        }

        return (float) (soma / avaliacoes.size());
    }

    // Quantidade de avaliações já feitas que o usuário recebeu
    @Transactional(readOnly = true)
    public long contarAvaliacoes(Long cdUsuario) {
        return avaliacaoRepository.countByAvaliadoCdUsuarioAndNotaIsNotNull(cdUsuario);
    }

    // Lista todas as avaliações de uma transação
    @Transactional(readOnly = true)
    public List<Avaliacao> listarPorTransacao(Long cdTransacao) {
        return avaliacaoRepository.findByTransacaoId(cdTransacao);
    }
}