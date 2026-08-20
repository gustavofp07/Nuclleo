package br.cefetmg.nuclleo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.cefetmg.nuclleo.dto.ArquivoResponseDTO;
import br.cefetmg.nuclleo.exception.ResourceNotFoundException;
import br.cefetmg.nuclleo.model.AnuncioRequerimento;
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
        return anuncioRequerimentoRepository.save(anuncio);
    }

    @Transactional
    public AnuncioRequerimento alterar(AnuncioRequerimento anuncio, MultipartFile foto) {
        aplicarFoto(anuncio, foto);
        return anuncioRequerimentoRepository.save(anuncio);
    }

    @Transactional(readOnly = true)
    public List<AnuncioRequerimento> listar() {
        List<AnuncioRequerimento> anuncios = anuncioRequerimentoRepository.findAll();
        return anuncios;
    }

    @Transactional(readOnly = true)
    public AnuncioRequerimento buscarAnuncioPorId(Long cdAnuncio) {
        return anuncioRequerimentoRepository.findById(cdAnuncio)
                .orElseThrow(() -> new ResourceNotFoundException("Anúncio de requerimento não encontrado."));
    }

    @Transactional(readOnly = true)
    public List<AnuncioRequerimento> buscarAnunciosPorUsuario(Long cdUsuario) {
        return anuncioRequerimentoRepository.findByUsuarioCria_CdUsuario(cdUsuario);
    }

    private void aplicarFoto(AnuncioRequerimento anuncio, MultipartFile foto) {
        if (foto != null && !foto.isEmpty()) {
            ArquivoResponseDTO arquivo = arquivoIntegracaoService.enviarArquivo(foto);
            anuncio.setFtAnuncio(arquivo.getUrl());
        }
    }

}
