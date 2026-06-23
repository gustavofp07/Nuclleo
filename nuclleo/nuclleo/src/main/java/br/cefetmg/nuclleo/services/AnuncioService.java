package br.cefetmg.nuclleo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.repository.AnuncioRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class AnuncioService {
    @Autowired
    private AnuncioRepository anuncioRepository;

    @Transactional(readOnly = true)
    public List<Anuncio> listar() {
        List<Anuncio> anuncios = anuncioRepository.findAll();
        return anuncios;
    }


    @Transactional(readOnly = true)
    public Anuncio buscarPorId(Long cdAnuncio) {
        Anuncio anuncio = anuncioRepository.findById(cdAnuncio).orElseThrow();
        return anuncio;
    }

    @Transactional(readOnly = true)
    public List<Anuncio> listarAnunciosPorUsuario(Long cdUsuario) {
        List<Anuncio> anuncios = anuncioRepository.findByUsuarioCria_CdUsuario(cdUsuario);
        return anuncios;
    }

    @Transactional
    public void excluir(Anuncio anuncio) {
        anuncioRepository.delete(anuncio);
    }

}
