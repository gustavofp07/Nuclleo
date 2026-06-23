package br.cefetmg.nuclleo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.cefetmg.nuclleo.model.AnuncioVenda;
import br.cefetmg.nuclleo.repository.AnuncioVendaRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class AnuncioVendaService {
    @Autowired
    private AnuncioVendaRepository anuncioVendaRepository;

    @Transactional
    public AnuncioVenda inserir(AnuncioVenda anuncio) {
        return anuncioVendaRepository.save(anuncio);
    }

    @Transactional
    public AnuncioVenda alterar(AnuncioVenda anuncio) {
        return anuncioVendaRepository.save(anuncio);
    }

    @Transactional(readOnly = true)
    public List<AnuncioVenda> listar() {
        return anuncioVendaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public AnuncioVenda buscarAnuncioPorId(Long cdAnuncio) {
        return anuncioVendaRepository.findById(cdAnuncio).orElseThrow();
    }

    @Transactional(readOnly = true)
    public List<AnuncioVenda> buscarAnunciosPorUsuario(Long cdUsuario) {
        return anuncioVendaRepository.findByUsuarioCria_CdUsuario(cdUsuario);
    }
}
