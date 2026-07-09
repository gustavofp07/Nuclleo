package br.cefetmg.nuclleo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.AnuncioComunidade;
import br.cefetmg.nuclleo.repository.AnuncioComunidadeRepository;

@Service
public class AnuncioComunidadeService {
    @Autowired
    private AnuncioComunidadeRepository repository;

    @Transactional
    public AnuncioComunidade inserir(AnuncioComunidade anuncioComunidade) {
        return repository.save(anuncioComunidade);
    }

    @Transactional
    public List<AnuncioComunidade> inserirRelacoes(List<AnuncioComunidade> relacoes) {
        return repository.saveAll(relacoes);
    }

    @Transactional(readOnly = true)
    public List<Anuncio> listarAnunciosDaComunidade(Long cdComunidade) {
        return repository.findAnunciosByComunidade(cdComunidade);
    }

    @Transactional(readOnly = true)
    public List<AnuncioComunidade> listarAnuncioComunidade() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<AnuncioComunidade> listarPorAnuncio(Long cdAnuncio) {
        return repository.findByAnuncioCdAnuncio(cdAnuncio);
    }

    @Transactional(readOnly = true)
    public List<AnuncioComunidade> listarPorComunidade(Long cdComunidade) {
        return repository.findByComunidadeCdComunidade(cdComunidade);
    }

    @Transactional
    public List<AnuncioComunidade> excluirPorComunidade(Long cdComunidade) {
        return repository.deleteByComunidadeCdComunidade(cdComunidade);
    }

    @Transactional
    public List<AnuncioComunidade> excluirPorAnuncio(Long cdAnuncio) {
        return repository.deleteByAnuncioCdAnuncio(cdAnuncio);
    }

    @Transactional
    public AnuncioComunidade excluirRelacaoEspecifica(Long cdAnuncio, Long cdComunidade) {
        return repository.deleteByAnuncioCdAnuncioAndComunidadeCdComunidade(cdAnuncio, cdComunidade);
    }
}
