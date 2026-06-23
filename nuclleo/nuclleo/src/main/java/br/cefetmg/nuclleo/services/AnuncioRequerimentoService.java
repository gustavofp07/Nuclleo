package br.cefetmg.nuclleo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.cefetmg.nuclleo.model.AnuncioRequerimento;
import br.cefetmg.nuclleo.repository.AnuncioRequerimentoRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class AnuncioRequerimentoService {
    @Autowired
    private AnuncioRequerimentoRepository anuncioRequerimentoRepository;

    @Transactional
    public AnuncioRequerimento inserir(AnuncioRequerimento anuncio) {
        return anuncioRequerimentoRepository.save(anuncio);
    }

    @Transactional
    public AnuncioRequerimento alterar(AnuncioRequerimento anuncio) {
        return anuncioRequerimentoRepository.save(anuncio);
    }

    @Transactional(readOnly = true)
    public List<AnuncioRequerimento> listar() {
        List<AnuncioRequerimento> anuncios = anuncioRequerimentoRepository.findAll();
        return anuncios;
    }

    @Transactional(readOnly = true)
    public AnuncioRequerimento buscarAnuncioPorId(Long cdAnuncio) {
        return anuncioRequerimentoRepository.findById(cdAnuncio).orElseThrow();
    }

    @Transactional(readOnly = true)
    public List<AnuncioRequerimento> buscarAnunciosPorUsuario(Long cdUsuario) {
        return anuncioRequerimentoRepository.findByUsuarioCria_CdUsuario(cdUsuario);
    }

}
