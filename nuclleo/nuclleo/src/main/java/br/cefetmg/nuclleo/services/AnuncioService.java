package br.cefetmg.nuclleo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.cefetmg.nuclleo.exception.ResourceNotFoundException;
import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.Status;
import br.cefetmg.nuclleo.repository.AnuncioRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class AnuncioService {
    @Autowired
    private AnuncioRepository anuncioRepository;

    @Autowired
    private ModeracaoService moderacaoService;

    // Listagem pública: só anúncios ATIVOS de donos ATIVOS
    @Transactional(readOnly = true)
    public List<Anuncio> listar() {
        return anuncioRepository.findByStatusAndUsuarioCria_Status(Status.ATIVO, Status.ATIVO);
    }

    /**
     * Busca SEM filtro de status. Uso interno (interesses, denúncias, admin).
     * Para responder a um usuário comum, use buscarVisivel.
     */
    @Transactional(readOnly = true)
    public Anuncio buscarPorId(Long cdAnuncio) {
        return anuncioRepository.findById(cdAnuncio)
                .orElseThrow(() -> new ResourceNotFoundException("Anúncio não encontrado."));
    }

    /**
     * Busca respeitando o status: anúncio suspenso (ou de dono suspenso) só
     * aparece para o próprio dono; anúncio excluído não aparece para ninguém.
     */
    @Transactional(readOnly = true)
    public Anuncio buscarVisivel(Long cdAnuncio, String emailSolicitante) {
        Anuncio anuncio = buscarPorId(cdAnuncio);
        if (!visivelPara(anuncio, emailSolicitante)) {
            throw new ResourceNotFoundException("Anúncio não encontrado.");
        }
        return anuncio;
    }

    /**
     * O dono vê todos os seus anúncios, menos os excluídos (inclusive os suspensos,
     * para o front mostrar o aviso). As outras pessoas veem só os ativos.
     */
    @Transactional(readOnly = true)
    public List<Anuncio> listarAnunciosPorUsuario(Long cdUsuario, String emailSolicitante) {
        List<Anuncio> anuncios = anuncioRepository.findByUsuarioCria_CdUsuarioAndStatusNot(cdUsuario, Status.EXCLUIDO);

        if (!anuncios.isEmpty() && ehDono(anuncios.get(0), emailSolicitante)) {
            return anuncios;
        }

        return anuncios.stream()
                .filter(a -> a.getStatus() == Status.ATIVO && a.getUsuarioCria().getStatus() == Status.ATIVO)
                .toList();
    }

    /** O dono exclui o próprio anúncio (exclusão lógica). */
    @Transactional
    public Anuncio excluir(Long cdAnuncio, String emailSolicitante) {
        return moderacaoService.excluirAnuncioPeloDono(cdAnuncio, emailSolicitante);
    }

    // ===== Regras de visibilidade (usadas também pelos services de venda e requerimento) =====

    public static boolean ehDono(Anuncio anuncio, String email) {
        return email != null
                && anuncio.getUsuarioCria() != null
                && email.equalsIgnoreCase(anuncio.getUsuarioCria().getEmail());
    }

    public static boolean visivelPara(Anuncio anuncio, String email) {
        if (anuncio.getStatus() == Status.EXCLUIDO) {
            return false;
        }
        if (ehDono(anuncio, email)) {
            return true;
        }
        return anuncio.getStatus() == Status.ATIVO
                && anuncio.getUsuarioCria().getStatus() == Status.ATIVO;
    }
}
