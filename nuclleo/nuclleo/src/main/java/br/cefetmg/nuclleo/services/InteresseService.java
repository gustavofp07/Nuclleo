package br.cefetmg.nuclleo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.cefetmg.nuclleo.dto.InteresseRequestDTO;
import br.cefetmg.nuclleo.dto.TransacaoRequestDTO;
import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.Avaliacao;
import br.cefetmg.nuclleo.model.Interesse;
import br.cefetmg.nuclleo.model.Transacao;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.AvaliacaoRepository;
import br.cefetmg.nuclleo.repository.InteresseRepository;
import br.cefetmg.nuclleo.repository.MensagemRepository;
import br.cefetmg.nuclleo.repository.TransacaoRepository;
import br.cefetmg.nuclleo.dto.AvaliarAnuncianteRequestDTO;
import br.cefetmg.nuclleo.dto.FinalizarConversaRequestDTO;

import org.springframework.transaction.annotation.Transactional;

@Service
public class InteresseService {
    @Autowired
    private InteresseRepository interesseRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private AnuncioService anuncioService;

    @Autowired
    private TransacaoService transacaoService;

    @Autowired
    private AvaliacaoService avaliacaoService;

    @Autowired
    private AvaliacaoRepository avaliacaoRepository;

    @Autowired
    private MensagemRepository mensagemRepository;

    @Transactional
    public Interesse inserir(InteresseRequestDTO dto) {

        Usuario usuario = usuarioService.buscarPorId(dto.getCdUsuario());

        Anuncio anuncio = anuncioService.buscarPorId(dto.getCdAnuncio());

        if (usuario.getCdUsuario() == anuncio.getUsuarioCria().getCdUsuario()) {
            throw new IllegalArgumentException("O usuário não pode demonstrar interesse em seu próprio anúncio.");
        }

        Interesse interesse = new Interesse();
        interesse.setUsuario(usuario);
        interesse.setAnuncio(anuncio);
        interesse.setData(new java.sql.Date(System.currentTimeMillis()));

        return interesseRepository.save(interesse);
    }

    @Transactional
    public void finalizarConversa(Long idInteresse, Long cdUsuarioSolicitante, FinalizarConversaRequestDTO dto) {
        Interesse interesse = buscarPorId(idInteresse);

        Usuario anunciante = interesse.getAnuncio().getUsuarioCria();
        Usuario interessado = interesse.getUsuario();

        if (!anunciante.getCdUsuario().equals(cdUsuarioSolicitante)) {
            throw new IllegalArgumentException("Apenas o anunciante pode finalizar a conversa.");
        }

        if (interesse.isFinalizado()) {
            throw new IllegalArgumentException("Esta conversa já foi finalizada.");
        }

        if (dto.isOcorreuTransacao()) {
            if (dto.getValor() == null || dto.getValor() <= 0) {
                throw new IllegalArgumentException("Informe um valor válido para a transação.");
            }

            TransacaoRequestDTO transacaoDto = new TransacaoRequestDTO();
            transacaoDto.setValor(dto.getValor());
            transacaoDto.setCdUsuario(interessado.getCdUsuario());
            transacaoDto.setCdAnuncio(interesse.getAnuncio().getCdAnuncio());

            Transacao transacao = transacaoService.inserir(transacaoDto);

            // avaliação do anunciante sobre o interessado (índice 1 = user2->user1 =
            // anunciante->interessado)
            Avaliacao avaliacaoAnunciantePraInteressado = avaliacaoRepository
                    .findByTransacaoId(transacao.getId()).stream()
                    .filter(a -> a.getAvaliador().getCdUsuario().equals(anunciante.getCdUsuario()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Falha ao localizar avaliação gerada."));

            avaliacaoService.avaliar(avaliacaoAnunciantePraInteressado.getCdAvaliacao(), anunciante.getCdUsuario(),
                    dto.getNotaInteressado());
        } else {
            List<Avaliacao> par = avaliacaoService.criarAvaliacoesPendentes(interessado, anunciante);
            // índice 1 = user2->user1 = anunciante->interessado
            avaliacaoService.avaliar(par.get(1).getCdAvaliacao(), anunciante.getCdUsuario(), dto.getNotaInteressado());
        }

        interesse.setFinalizado(true);
        interesse.setAvaliacaoInteressadoFeita(true);
        interesseRepository.save(interesse);

        excluirSeAmbosAvaliaram(interesse);
    }

    @Transactional
    public void avaliarAnunciante(Long idInteresse, Long cdUsuarioSolicitante, AvaliarAnuncianteRequestDTO dto) {
        Interesse interesse = buscarPorId(idInteresse);

        Usuario anunciante = interesse.getAnuncio().getUsuarioCria();
        Usuario interessado = interesse.getUsuario();

        if (!interessado.getCdUsuario().equals(cdUsuarioSolicitante)) {
            throw new IllegalArgumentException("Apenas o interessado pode avaliar o anunciante.");
        }

        if (!interesse.isFinalizado()) {
            throw new IllegalArgumentException("A conversa ainda não foi finalizada pelo anunciante.");
        }

        if (interesse.isAvaliacaoAnuncianteFeita()) {
            throw new IllegalArgumentException("Você já avaliou o anunciante.");
        }

        List<Avaliacao> pendentes = avaliacaoRepository
                .findByAvaliadorCdUsuarioAndAvaliadoCdUsuarioAndNotaIsNull(interessado.getCdUsuario(),
                        anunciante.getCdUsuario());

        if (pendentes.isEmpty()) {
            throw new RuntimeException("Nenhuma avaliação pendente encontrada.");
        }

        avaliacaoService.avaliar(pendentes.get(0).getCdAvaliacao(), interessado.getCdUsuario(), dto.getNota());

        interesse.setAvaliacaoAnuncianteFeita(true);
        interesseRepository.save(interesse);

        excluirSeAmbosAvaliaram(interesse);
    }

    private void excluirSeAmbosAvaliaram(Interesse interesse) {
        if (interesse.isAvaliacaoInteressadoFeita() && interesse.isAvaliacaoAnuncianteFeita()) {
            mensagemRepository.deleteByInteresseId(interesse.getId());
            interesseRepository.delete(interesse);
        }
    }

    @Transactional
    public void aceitarInteresse(Long idInteresse, Long cdUsuarioSolicitante) {
        Interesse interesse = buscarPorId(idInteresse);

        Usuario anunciante = interesse.getAnuncio().getUsuarioCria();

        if (!anunciante.getCdUsuario().equals(cdUsuarioSolicitante)) {
            throw new IllegalArgumentException("Apenas o anunciante pode aceitar a solicitação de chat.");
        }

        if (interesse.isAceito()) {
            throw new IllegalArgumentException("Esta solicitação de chat já foi aceita.");
        }

        interesse.setAceito(true);
        interesseRepository.save(interesse);
    }

    @Transactional
    public void excluir(Long id) {
        Interesse interesse = interesseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interesse não encontrado. Id: " + id));
        mensagemRepository.deleteByInteresseId(interesse.getId());
        interesseRepository.delete(interesse);
    }

    @Transactional(readOnly = true)
    public Interesse buscarPorId(Long id) {
        return interesseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interesse não encontrado. Id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Interesse> listarPorUsuario(Long id) {
        return interesseRepository.findByUsuarioCdUsuario(id);
    }

    @Transactional(readOnly = true)
    public List<Interesse> listarPorAnuncio(Long id) {
        return interesseRepository.findByAnuncioCdAnuncio(id);
    }

    @Transactional(readOnly = true)
    public List<Interesse> listarPorInteressados(Long cdUsuario) {
        return interesseRepository.findByAnuncioUsuarioCriaCdUsuario(cdUsuario);
    }
}