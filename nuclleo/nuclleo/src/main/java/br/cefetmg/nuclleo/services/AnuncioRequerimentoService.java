package br.cefetmg.nuclleo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.cefetmg.nuclleo.dto.ArquivoResponseDTO;
import br.cefetmg.nuclleo.exception.ForbiddenException;
import br.cefetmg.nuclleo.exception.ResourceNotFoundException;
import br.cefetmg.nuclleo.model.AnuncioRequerimento;
import br.cefetmg.nuclleo.model.Status;
import br.cefetmg.nuclleo.repository.AnuncioRequerimentoRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class AnuncioRequerimentoService {
    @Autowired
    private AnuncioRequerimentoRepository anuncioRequerimentoRepository;

    @Autowired
    private ArquivoIntegracaoService arquivoIntegracaoService;

    @Transactional
    public AnuncioRequerimento inserir(AnuncioRequerimento anuncio, MultipartFile foto) {
        aplicarFoto(anuncio, foto);
        return anuncioRequerimentoRepository.save(anuncio); // o status ATIVO é definido no @PrePersist
    }

    @Transactional
    public AnuncioRequerimento alterar(AnuncioRequerimento anuncio, MultipartFile foto, String emailSolicitante) {
        AnuncioRequerimento existente = anuncioRequerimentoRepository.findById(anuncio.getCdAnuncio())
                .orElseThrow(() -> new ResourceNotFoundException("Anúncio de requerimento não encontrado."));

        if (existente.getStatus() == Status.EXCLUIDO) {
            throw new ResourceNotFoundException("Anúncio de requerimento não encontrado.");
        }

        if (!AnuncioService.ehDono(existente, emailSolicitante)) {
            throw new ForbiddenException("Você só pode alterar os seus próprios anúncios.");
        }

        // Campos controlados pelo sistema: nunca vêm do front
        anuncio.setStatus(existente.getStatus());
        anuncio.setSuspensoAte(existente.getSuspensoAte());
        anuncio.setUsuarioCria(existente.getUsuarioCria());
        anuncio.setDtCriacao(existente.getDtCriacao());

        aplicarFoto(anuncio, foto);
        return anuncioRequerimentoRepository.save(anuncio);
    }

    // Listagem pública: só anúncios ATIVOS de donos ATIVOS
    @Transactional(readOnly = true)
    public List<AnuncioRequerimento> listar() {
        return anuncioRequerimentoRepository.findByStatusAndUsuarioCria_Status(Status.ATIVO, Status.ATIVO);
    }

    @Transactional(readOnly = true)
    public AnuncioRequerimento buscarAnuncioPorId(Long cdAnuncio, String emailSolicitante) {
        AnuncioRequerimento anuncio = anuncioRequerimentoRepository.findById(cdAnuncio)
                .orElseThrow(() -> new ResourceNotFoundException("Anúncio de requerimento não encontrado."));

        if (!AnuncioService.visivelPara(anuncio, emailSolicitante)) {
            throw new ResourceNotFoundException("Anúncio de requerimento não encontrado.");
        }
        return anuncio;
    }

    // O dono vê todos os seus (menos excluídos); as outras pessoas veem só os ativos
    @Transactional(readOnly = true)
    public List<AnuncioRequerimento> buscarAnunciosPorUsuario(Long cdUsuario, String emailSolicitante) {
        List<AnuncioRequerimento> anuncios = anuncioRequerimentoRepository
                .findByUsuarioCria_CdUsuarioAndStatusNot(cdUsuario, Status.EXCLUIDO);

        if (!anuncios.isEmpty() && AnuncioService.ehDono(anuncios.get(0), emailSolicitante)) {
            return anuncios;
        }

        return anuncios.stream()
                .filter(a -> a.getStatus() == Status.ATIVO && a.getUsuarioCria().getStatus() == Status.ATIVO)
                .toList();
    }

    private void aplicarFoto(AnuncioRequerimento anuncio, MultipartFile foto) {
        if (foto != null && !foto.isEmpty()) {
            ArquivoResponseDTO arquivo = arquivoIntegracaoService.enviarArquivo(foto);
            anuncio.setFtAnuncio(arquivo.getUrl());
        }
    }

}
