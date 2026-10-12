package br.cefetmg.nuclleo.services;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefetmg.nuclleo.dto.MensagemComunidadeDTO;
import br.cefetmg.nuclleo.dto.MensagemComunidadeRequestDTO;
import br.cefetmg.nuclleo.exception.BusinessException;
import br.cefetmg.nuclleo.exception.ForbiddenException;
import br.cefetmg.nuclleo.exception.ResourceNotFoundException;
import br.cefetmg.nuclleo.model.Comunidade;
import br.cefetmg.nuclleo.model.MensagemComunidade;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.ComunidadeRepository;
import br.cefetmg.nuclleo.repository.MensagemComunidadeRepository;
import br.cefetmg.nuclleo.repository.UsuarioComunidadeRepository;
import br.cefetmg.nuclleo.repository.UsuarioRepository;

/**
 * Chat em grupo das comunidades.
 *
 * - Só membros (ou o criador) leem e enviam mensagens.
 * - O remetente vem do token, nunca do corpo da requisição.
 * - Apagar: o próprio remetente ou o criador da comunidade (moderação).
 * - Quem está com o chat aberto recebe as novidades pelo WebSocket:
 *   /topic/comunidade/{cd}          -> nova mensagem
 *   /topic/comunidade/{cd}/apagada  -> mensagem apagada
 */
@Service
public class MensagemComunidadeService {

    // Quantas mensagens o chat carrega ao abrir (as mais recentes)
    private static final int LIMITE_HISTORICO = 200;

    @Autowired
    private MensagemComunidadeRepository mensagemRepository;

    @Autowired
    private ComunidadeRepository comunidadeRepository;

    @Autowired
    private UsuarioComunidadeRepository usuarioComunidadeRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<MensagemComunidadeDTO> listar(Long cdComunidade, String emailSolicitante) {
        Comunidade comunidade = buscarComunidade(cdComunidade);
        Usuario usuario = buscarUsuario(emailSolicitante);
        validarMembro(comunidade, usuario);

        List<MensagemComunidade> recentes = mensagemRepository
                .findTop200ByComunidadeCdComunidadeOrderByDataEnvioDesc(cdComunidade);
        Collections.reverse(recentes);

        return recentes.stream().map(MensagemComunidadeDTO::new).toList();
    }

    @Transactional
    public MensagemComunidadeDTO enviar(Long cdComunidade, MensagemComunidadeRequestDTO dto, String emailRemetente) {
        Comunidade comunidade = buscarComunidade(cdComunidade);
        Usuario remetente = buscarUsuario(emailRemetente);
        validarMembro(comunidade, remetente);

        MensagemComunidade mensagem = new MensagemComunidade();
        mensagem.setComunidade(comunidade);
        mensagem.setRemetente(remetente);
        mensagem.setConteudo(dto.getConteudo().trim());

        if (dto.getCdMensagemResposta() != null) {
            MensagemComunidade respondida = mensagemRepository.findById(dto.getCdMensagemResposta())
                    .orElseThrow(() -> new ResourceNotFoundException("Mensagem respondida não encontrada."));

            if (!respondida.getComunidade().getCdComunidade().equals(cdComunidade)) {
                throw new BusinessException("A mensagem respondida não é desta comunidade.");
            }
            if (respondida.isApagada()) {
                throw new BusinessException("Não é possível responder uma mensagem apagada.");
            }
            mensagem.setRespostaA(respondida);
        }

        MensagemComunidadeDTO salva = new MensagemComunidadeDTO(mensagemRepository.save(mensagem));
        messagingTemplate.convertAndSend("/topic/comunidade/" + cdComunidade, salva);
        return salva;
    }

    @Transactional
    public MensagemComunidadeDTO apagar(Long cdMensagem, String emailSolicitante) {
        MensagemComunidade mensagem = mensagemRepository.findById(cdMensagem)
                .orElseThrow(() -> new ResourceNotFoundException("Mensagem não encontrada."));
        Usuario solicitante = buscarUsuario(emailSolicitante);

        boolean ehRemetente = mensagem.getRemetente().getCdUsuario().equals(solicitante.getCdUsuario());
        boolean ehCriador = ehCriador(mensagem.getComunidade(), solicitante);

        if (!ehRemetente && !ehCriador) {
            throw new ForbiddenException("Você só pode apagar as suas próprias mensagens.");
        }

        if (!mensagem.isApagada()) {
            mensagem.setApagada(true);
            mensagemRepository.save(mensagem);
        }

        MensagemComunidadeDTO dto = new MensagemComunidadeDTO(mensagem);
        messagingTemplate.convertAndSend(
                "/topic/comunidade/" + mensagem.getComunidade().getCdComunidade() + "/apagada", dto);
        return dto;
    }

    /** Usado ao excluir a comunidade: apaga todo o histórico do chat. */
    @Transactional
    public void excluirPorComunidade(Long cdComunidade) {
        mensagemRepository.deleteByComunidade(cdComunidade);
    }

    // =====================================================================
    // AUXILIARES
    // =====================================================================

    private void validarMembro(Comunidade comunidade, Usuario usuario) {
        boolean membro = usuarioComunidadeRepository.existsByUsuarioCdUsuarioAndComunidadeCdComunidade(
                usuario.getCdUsuario(), comunidade.getCdComunidade());

        if (!membro && !ehCriador(comunidade, usuario)) {
            throw new ForbiddenException("Entre na comunidade para usar o chat.");
        }
    }

    private boolean ehCriador(Comunidade comunidade, Usuario usuario) {
        return comunidade.getUsuarioCria() != null
                && comunidade.getUsuarioCria().getCdUsuario().equals(usuario.getCdUsuario());
    }

    private Comunidade buscarComunidade(Long cdComunidade) {
        return comunidadeRepository.findById(cdComunidade)
                .orElseThrow(() -> new ResourceNotFoundException("Comunidade não encontrada."));
    }

    private Usuario buscarUsuario(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
    }
}
