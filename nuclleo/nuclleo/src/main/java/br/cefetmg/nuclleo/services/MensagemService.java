package br.cefetmg.nuclleo.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.cefetmg.nuclleo.dto.MensagemDTO;
import br.cefetmg.nuclleo.dto.MensagemRequestDTO;
import br.cefetmg.nuclleo.exception.BusinessException;
import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.Interesse;
import br.cefetmg.nuclleo.model.Mensagem;
import br.cefetmg.nuclleo.model.Status;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.MensagemRepository;

@Service
public class MensagemService {

    @Autowired
    private MensagemRepository mensagemRepository;

    @Autowired
    private InteresseService interesseService;

    @Autowired
    private UsuarioService usuarioService;

    public MensagemDTO salvar(Long cdInteresse, MensagemRequestDTO dto) {
        Interesse interesse = interesseService.buscarPorId(cdInteresse);
        Usuario remetente = usuarioService.buscarPorId(dto.getCdUsuarioRemetente());

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

        Mensagem mensagem = new Mensagem();
        mensagem.setInteresse(interesse);
        mensagem.setRemetente(remetente);
        mensagem.setConteudo(dto.getConteudo());

        Mensagem salva = mensagemRepository.save(mensagem);
        return MensagemDTO.of(salva);
    }

    public List<MensagemDTO> listarPorInteresse(Long cdInteresse) {
        List<Mensagem> mensagens = mensagemRepository.findByInteresseIdOrderByDataEnvioAsc(cdInteresse);
        return mensagens.stream().map(MensagemDTO::of).collect(Collectors.toList());
    }
}
