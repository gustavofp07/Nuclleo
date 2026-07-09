package br.cefetmg.nuclleo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import br.cefetmg.nuclleo.model.Comunidade;
import br.cefetmg.nuclleo.repository.AnuncioComunidadeRepository;
import br.cefetmg.nuclleo.repository.ComunidadeRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class ComunidadeService {
    @Autowired
    private ComunidadeRepository comunidadeRepository;

    //apagar depois que criar o service
    @Autowired
    private AnuncioComunidadeRepository anuncioComunidadeRepository;

    //eu ainda n criei esse service. Depois de criar corrigir a função excluirComunidade
    /*
    @Autowired
    private AnuncioComunidadeService anuncioComunidadeService;
    */

    @Autowired
    private UsuarioComunidadeService usuarioComunidadeService;

    @Transactional
    public Comunidade inserir(Comunidade comunidade) {
        comunidade.setDtCriacao(new java.sql.Date(System.currentTimeMillis()));

        Comunidade objComunidade = comunidadeRepository.save(comunidade);

        //salvar na tabela N:N de usuarioComunidade o usuario que criou a comunidade
        if (objComunidade != null) {
            usuarioComunidadeService.inserir(objComunidade.getUsuarioCria(), objComunidade);
        }


        return objComunidade;
    }

    @Transactional
    public Comunidade alterar(Long cdComunidade, Comunidade comunidade) {
        Comunidade objComunidade = comunidadeRepository.findById(cdComunidade)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidade não encontrada."));

        objComunidade.setNmComunidade(comunidade.getNmComunidade());
        objComunidade.setDescricao(comunidade.getDescricao());
        // objComunidade.setDtCriacao(comunidade.getDtCriacao());
        // objComunidade.setCdUsuarioCriacao();

        return comunidadeRepository.save(objComunidade);
    }

    @Transactional
    public Comunidade excluir(Long cdComunidade) {
        Comunidade comunidade = comunidadeRepository.findById(cdComunidade)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidade não encontrada."));

                
        // Deletar nas tabelas N:N
        //corrigir aqui para padronizar chamar o service primeiro
        //this.anuncioComunidadeService.excluirPorComunidade(cdComunidade);
        this.anuncioComunidadeRepository.deleteByComunidadeCdComunidade(cdComunidade);

        this.usuarioComunidadeService.excluirPorComunidade(cdComunidade);
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidade não encontrada."));
    }

    @Transactional(readOnly = true)
    public List<Comunidade> getComunidadesPorUsuario(Long cdUsuario) {
        return comunidadeRepository.findByUsuarioCria_CdUsuario(cdUsuario);
    }
}