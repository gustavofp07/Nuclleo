package br.cefetmg.nuclleo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.cefetmg.nuclleo.dto.ArquivoResponseDTO;
import br.cefetmg.nuclleo.exception.ForbiddenException;
import br.cefetmg.nuclleo.exception.ResourceNotFoundException;
import br.cefetmg.nuclleo.model.AnuncioVenda;
import br.cefetmg.nuclleo.model.Status;
import br.cefetmg.nuclleo.repository.AnuncioVendaRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class AnuncioVendaService {
    @Autowired
    private AnuncioVendaRepository anuncioVendaRepository;

    @Autowired
    private ArquivoIntegracaoService arquivoIntegracaoService;

    @Transactional
    public AnuncioVenda inserir(AnuncioVenda anuncio, MultipartFile foto) {
        aplicarFoto(anuncio, foto);
        return anuncioVendaRepository.save(anuncio); // o status ATIVO é definido no @PrePersist
    }

    @Transactional
    public AnuncioVenda alterar(AnuncioVenda anuncio, MultipartFile foto, String emailSolicitante) {
        AnuncioVenda existente = anuncioVendaRepository.findById(anuncio.getCdAnuncio())
                .orElseThrow(() -> new ResourceNotFoundException("Anúncio de venda não encontrado."));

        if (existente.getStatus() == Status.EXCLUIDO) {
            throw new ResourceNotFoundException("Anúncio de venda não encontrado.");
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
        return anuncioVendaRepository.save(anuncio);
    }

    // Listagem pública: só anúncios ATIVOS de donos ATIVOS
    @Transactional(readOnly = true)
    public List<AnuncioVenda> listar() {
        return anuncioVendaRepository.findByStatusAndUsuarioCria_Status(Status.ATIVO, Status.ATIVO);
    }

    @Transactional(readOnly = true)
    public AnuncioVenda buscarAnuncioPorId(Long cdAnuncio, String emailSolicitante) {
        AnuncioVenda anuncio = anuncioVendaRepository.findById(cdAnuncio)
                .orElseThrow(() -> new ResourceNotFoundException("Anúncio de venda não encontrado."));

        if (!AnuncioService.visivelPara(anuncio, emailSolicitante)) {
            throw new ResourceNotFoundException("Anúncio de venda não encontrado.");
        }
        return anuncio;
    }

    // O dono vê todos os seus (menos excluídos); as outras pessoas veem só os ativos
    @Transactional(readOnly = true)
    public List<AnuncioVenda> buscarAnunciosPorUsuario(Long cdUsuario, String emailSolicitante) {
        List<AnuncioVenda> anuncios = anuncioVendaRepository
                .findByUsuarioCria_CdUsuarioAndStatusNot(cdUsuario, Status.EXCLUIDO);

        if (!anuncios.isEmpty() && AnuncioService.ehDono(anuncios.get(0), emailSolicitante)) {
            return anuncios;
        }

        return anuncios.stream()
                .filter(a -> a.getStatus() == Status.ATIVO && a.getUsuarioCria().getStatus() == Status.ATIVO)
                .toList();
    }

    private void aplicarFoto(AnuncioVenda anuncio, MultipartFile foto) {
        if (foto != null && !foto.isEmpty()) {
            ArquivoResponseDTO arquivo = arquivoIntegracaoService.enviarArquivo(foto);
            anuncio.setFtAnuncio(arquivo.getUrl());
        }
    }
}
