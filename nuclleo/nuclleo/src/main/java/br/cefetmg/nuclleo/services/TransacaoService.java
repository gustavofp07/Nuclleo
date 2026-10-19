package br.cefetmg.nuclleo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefetmg.nuclleo.dto.TransacaoRequestDTO;
import br.cefetmg.nuclleo.exception.ForbiddenException;
import br.cefetmg.nuclleo.exception.ResourceNotFoundException;
import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.Transacao;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.TransacaoRepository;
import br.cefetmg.nuclleo.repository.UsuarioRepository;

@Service
public class TransacaoService {
    @Autowired
    private TransacaoRepository transacaoRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

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

    /** Só quem comprou/vendeu (interessado ou dono do anúncio) vê a transação. */
    @Transactional(readOnly = true)
    public Transacao buscarPorId(Long id, String emailSolicitante) {
        Transacao transacao = transacaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada."));

        Long cdSolicitante = buscarSolicitante(emailSolicitante).getCdUsuario();
        boolean participante = transacao.getUsuario().getCdUsuario().equals(cdSolicitante)
                || transacao.getAnuncio().getUsuarioCria().getCdUsuario().equals(cdSolicitante);
        if (!participante) {
            throw new ForbiddenException("Você não participou desta transação.");
        }
        return transacao;
    }

    @Transactional(readOnly = true)
    public List<Transacao> listarPorUsuarioEnvolvido(Long cdUsuario, String emailSolicitante) {
        if (!buscarSolicitante(emailSolicitante).getCdUsuario().equals(cdUsuario)) {
            throw new ForbiddenException("Você só pode ver as suas próprias transações.");
        }
        return transacaoRepository.findByUsuarioCdUsuarioOrAnuncioUsuarioCriaCdUsuarioOrderByDataDesc(cdUsuario, cdUsuario);
    }

    @Transactional(readOnly = true)
    public List<Transacao> listarPorAnuncio(Long cdAnuncio, String emailSolicitante) {
        Anuncio anuncio = anuncioService.buscarPorId(cdAnuncio);
        if (!anuncio.getUsuarioCria().getCdUsuario().equals(buscarSolicitante(emailSolicitante).getCdUsuario())) {
            throw new ForbiddenException("Só o dono do anúncio vê as transações dele.");
        }
        return transacaoRepository.findByAnuncioCdAnuncio(cdAnuncio);
    }

    private Usuario buscarSolicitante(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
    }
}
