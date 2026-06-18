package br.cefetmg.nuclleo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.cefetmg.nuclleo.model.Comunidade;
import br.cefetmg.nuclleo.repository.AnuncioComunidadeRepository;
import br.cefetmg.nuclleo.repository.ComunidadeRepository;
import br.cefetmg.nuclleo.repository.UsuarioComunidadeRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class ComunidadeService {
    @Autowired
    private ComunidadeRepository comunidadeRepository;

    @Autowired
    private AnuncioComunidadeRepository anuncioComunidadeRepository;

    @Autowired
    private UsuarioComunidadeRepository usuarioComunidadeRepository;

    @Transactional
    public Comunidade inserir(Comunidade comunidade) {
        comunidade.setDtCriacao(new java.sql.Date(System.currentTimeMillis()));

        return comunidadeRepository.save(comunidade);
    }

    @Transactional
    public Comunidade alterar(Long cdComunidade, Comunidade comunidade) {
        Comunidade objComunidade = comunidadeRepository.findById(cdComunidade)
                .orElseThrow(() -> new RuntimeException("Comunidade não encontrada"));

        objComunidade.setNmComunidade(comunidade.getNmComunidade());
        objComunidade.setDescricao(comunidade.getDescricao());
        // objComunidade.setDtCriacao(comunidade.getDtCriacao());
        // objComunidade.setCdUsuarioCriacao();

        return comunidadeRepository.save(objComunidade);
    }

    @Transactional
    public Comunidade excluir(Long cdComunidade) {
        Comunidade comunidade = comunidadeRepository.findById(cdComunidade)
                .orElseThrow(() -> new RuntimeException("Comunidade não encontrada"));

        // Deletar nas tabelas N:N
        this.anuncioComunidadeRepository.deleteByComunidadeCdComunidade(cdComunidade);
        this.usuarioComunidadeRepository.deleteByComunidadeCdComunidade(cdComunidade);
        comunidadeRepository.delete(comunidade);

        return comunidade;
    }

    @Transactional(readOnly = true)
    public List<Comunidade> listar() {
        return comunidadeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Comunidade buscarPorId(Long cdComunidade) {
        return comunidadeRepository.findById(cdComunidade)
                .orElseThrow(() -> new RuntimeException("Comunidade não encontrada"));
    }

    @Transactional(readOnly = true)
    public List<Comunidade> getComunidadesPorUsuario(Long cdUsuario) {
        return comunidadeRepository.findByUsuarioCria_CdUsuario(cdUsuario);
    }
}