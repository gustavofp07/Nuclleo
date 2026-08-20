package br.cefetmg.nuclleo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.cefetmg.nuclleo.dto.ArquivoResponseDTO;
import br.cefetmg.nuclleo.exception.ResourceNotFoundException;
import br.cefetmg.nuclleo.model.AnuncioVenda;
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
        return anuncioVendaRepository.save(anuncio);
    }

    @Transactional
    public AnuncioVenda alterar(AnuncioVenda anuncio, MultipartFile foto) {
        aplicarFoto(anuncio, foto);
        return anuncioVendaRepository.save(anuncio);
    }

    @Transactional(readOnly = true)
    public List<AnuncioVenda> listar() {
        return anuncioVendaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public AnuncioVenda buscarAnuncioPorId(Long cdAnuncio) {
        return anuncioVendaRepository.findById(cdAnuncio)
                .orElseThrow(() -> new ResourceNotFoundException("Anúncio de venda não encontrado."));
    }

    @Transactional(readOnly = true)
    public List<AnuncioVenda> buscarAnunciosPorUsuario(Long cdUsuario) {
        return anuncioVendaRepository.findByUsuarioCria_CdUsuario(cdUsuario);
    }

    private void aplicarFoto(AnuncioVenda anuncio, MultipartFile foto) {
        if (foto != null && !foto.isEmpty()) {
            ArquivoResponseDTO arquivo = arquivoIntegracaoService.enviarArquivo(foto);
            anuncio.setFtAnuncio(arquivo.getUrl());
        }
    }
}
