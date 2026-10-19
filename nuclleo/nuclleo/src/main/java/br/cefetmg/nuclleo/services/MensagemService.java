package br.cefetmg.nuclleo.services;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefetmg.nuclleo.dto.MensagemDTO;
import br.cefetmg.nuclleo.dto.MensagemRequestDTO;
import br.cefetmg.nuclleo.dto.Paginacao;
import br.cefetmg.nuclleo.exception.BusinessException;
import br.cefetmg.nuclleo.exception.ForbiddenException;
import br.cefetmg.nuclleo.exception.ResourceNotFoundException;
import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.Interesse;
import br.cefetmg.nuclleo.model.Mensagem;
import br.cefetmg.nuclleo.model.Status;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.InteresseRepository;
import br.cefetmg.nuclleo.repository.MensagemRepository;

@Service
public class MensagemService {

    // Quantas mensagens o interessado pode deixar antes de o anunciante aceitar a solicitação
    public static final int LIMITE_MENSAGENS_PENDENTES = 5;

    @Autowired
    private MensagemRepository mensagemRepository;

    @Autowired
    private InteresseService interesseService;

    @Autowired
    private InteresseRepository interesseRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public MensagemDTO salvar(Long cdInteresse, Long cdRemetente, MensagemRequestDTO dto) {
        Interesse interesse = interesseService.buscarPorId(cdInteresse);
        Usuario remetente = usuarioService.buscarPorId(cdRemetente);

        Anuncio anuncio = interesse.getAnuncio();
        Usuario anunciante = anuncio.getUsuarioCria();
        Usuario interessado = interesse.getUsuario();

        // O remetente precisa ser um dos dois participantes da conversa
        boolean participante = remetente.getCdUsuario().equals(anunciante.getCdUsuario())
                || remetente.getCdUsuario().equals(interessado.getCdUsuario());
        if (!participante) {
            throw new BusinessException("O remetente não participa desta conversa.");
        }

        // Conta suspensa/excluída ou anúncio indisponível: o chat fica bloqueado
        if (!anunciante.isAtivo() || !interessado.isAtivo() || anuncio.getStatus() != Status.ATIVO) {
            throw new BusinessException("Esta conversa não está mais disponível.");
        }

        if (!interesse.isConversaIniciada()) {
            throw new BusinessException("A conversa ainda não foi iniciada.");
        }

        // Solicitação pendente: só o interessado escreve, e só algumas mensagens de antemão
        if (!interesse.isAceito()) {
            if (!remetente.getCdUsuario().equals(interessado.getCdUsuario())) {
                throw new BusinessException("Aceite a solicitação de conversa antes de responder.");
            }
            if (mensagemRepository.countByInteresseId(cdInteresse) >= LIMITE_MENSAGENS_PENDENTES) {
                throw new BusinessException("Aguarde o anunciante aceitar a solicitação para enviar mais mensagens.");
            }
        }

        Mensagem mensagem = new Mensagem();
        mensagem.setInteresse(interesse);
        mensagem.setRemetente(remetente);
        mensagem.setConteudo(dto.getConteudo());

        if (dto.getCdMensagemResposta() != null) {
            Mensagem respondida = mensagemRepository.findById(dto.getCdMensagemResposta())
                    .orElseThrow(() -> new ResourceNotFoundException("Mensagem respondida não encontrada."));

            if (!respondida.getInteresse().getId().equals(cdInteresse)) {
                throw new BusinessException("A mensagem respondida não é desta conversa.");
            }
            if (respondida.isApagada()) {
                throw new BusinessException("Não é possível responder uma mensagem apagada.");
            }
            mensagem.setRespostaA(respondida);
        }

        Mensagem salva = mensagemRepository.save(mensagem);
        return MensagemDTO.of(salva);
    }

    /**
     * "Apagar para todos": só o remetente apaga, e a mensagem vira "Mensagem apagada"
     * para os dois. Os participantes com o chat aberto são avisados na hora.
     */
    @Transactional
    public MensagemDTO apagar(Long cdMensagem, String emailSolicitante) {
        Mensagem mensagem = mensagemRepository.findById(cdMensagem)
                .orElseThrow(() -> new ResourceNotFoundException("Mensagem não encontrada."));

        if (!mensagem.getRemetente().getEmail().equalsIgnoreCase(emailSolicitante)) {
            throw new ForbiddenException("Você só pode apagar as suas próprias mensagens.");
        }

        if (mensagem.getInteresse().isFinalizado()) {
            throw new BusinessException("Não é possível apagar mensagens de uma conversa finalizada.");
        }

        if (!mensagem.isApagada()) {
            mensagem.setApagada(true);
            mensagemRepository.save(mensagem);
        }

        MensagemDTO dto = MensagemDTO.of(mensagem);
        messagingTemplate.convertAndSend("/topic/chat/" + mensagem.getInteresse().getId() + "/apagada", dto);
        return dto;
    }

    /**
     * Histórico da conversa, só para os dois participantes. Vem em páginas:
     * sem "antesDe", as mensagens mais recentes; com "antesDe", as anteriores a ela.
     * Sempre em ordem cronológica.
     */
    @Transactional(readOnly = true)
    public List<MensagemDTO> listarPorInteresse(Long cdInteresse, String emailSolicitante, Long antesDe, int limite) {
        Usuario solicitante = usuarioService.buscarPorEmail(emailSolicitante);
        if (!interesseRepository.participaDaConversa(cdInteresse, solicitante.getCdUsuario())) {
            throw new ForbiddenException("Você não participa desta conversa.");
        }

        Pageable pagina = PageRequest.of(0, Paginacao.limitar(limite));
        List<Mensagem> mensagens = new ArrayList<>(antesDe == null
                ? mensagemRepository.findByInteresseIdOrderByIdDesc(cdInteresse, pagina)
                : mensagemRepository.findByInteresseIdAndIdLessThanOrderByIdDesc(cdInteresse, antesDe, pagina));
        Collections.reverse(mensagens);

        return mensagens.stream().map(MensagemDTO::of).collect(Collectors.toList());
    }
}
