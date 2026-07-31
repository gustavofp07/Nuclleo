package br.cefetmg.nuclleo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefetmg.nuclleo.dto.TransacaoRequestDTO;
import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.Transacao;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.TransacaoRepository;

@Service
public class TransacaoService {
    @Autowired
    private TransacaoRepository transacaoRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private AnuncioService anuncioService;

    @Autowired
    private AvaliacaoService avaliacaoService;

    @Transactional
    public Transacao inserir(TransacaoRequestDTO dto) {

        Usuario usuario = usuarioService.buscarPorId(dto.getCdUsuario());
        Anuncio anuncio = anuncioService.buscarPorId(dto.getCdAnuncio());

        // passar o id do usuário logado para o backend e verificar se é o mesmo do
        // usuário dono do anúncio
        /*
         * if
         * (anuncio.getUsuarioCria().getCdUsuario().equals(cdUsuarioLogado.getCdUsuario(
         * ))) {
         * throw new IllegalArgumentException("Usuário incorrespondente.");
         * }
         */

        Transacao transacao = new Transacao();
        transacao.setValor(dto.getValor());
        transacao.setUsuario(usuario);
        transacao.setAnuncio(anuncio);
        transacao.setData(new java.sql.Date(System.currentTimeMillis()));

        transacaoRepository.save(transacao);

        // Cria automaticamente as duas avaliações pendentes
        avaliacaoService.criarAvaliacoesPendentes(transacao);

        return transacao;
    }

    @Transactional(readOnly = true)
    public Transacao buscarPorId(Long id) {
        return transacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transação não encontrada. Id: " + id));
    }

    public List<Transacao> listarPorUsuario(Long id) {
        return transacaoRepository.findByUsuarioCdUsuario(id);
    }

    public List<Transacao> listarPorAnuncio(Long id) {
        return transacaoRepository.findByAnuncioCdAnuncio(id);
    }

    @Transactional(readOnly = true)
    public List<Transacao> listarTodos() {
        return transacaoRepository.findAll();
    }

    @Transactional
    public void excluir(Long id) {
        Transacao transacao = transacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transação não encontrada. Id: " + id));
        transacaoRepository.delete(transacao);
    }
}