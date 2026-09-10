package br.cefetmg.nuclleo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;

import br.cefetmg.nuclleo.dto.ArquivoResponseDTO;
import br.cefetmg.nuclleo.dto.ViaCepResponseDTO;
import br.cefetmg.nuclleo.exception.BusinessException;
import br.cefetmg.nuclleo.exception.ResourceNotFoundException;
import br.cefetmg.nuclleo.model.Comunidade;
import br.cefetmg.nuclleo.repository.AnuncioComunidadeRepository;
import br.cefetmg.nuclleo.repository.ComunidadeRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class ComunidadeService {
    @Autowired
    private ComunidadeRepository comunidadeRepository;

    // apagar depois que criar o service
    @Autowired
    private AnuncioComunidadeRepository anuncioComunidadeRepository;

    // eu ainda n criei esse service. Depois de criar corrigir a função
    // excluirComunidade
    /*
     * @Autowired
     * private AnuncioComunidadeService anuncioComunidadeService;
     */

    @Autowired
    private UsuarioComunidadeService usuarioComunidadeService;

    @Autowired
    private ArquivoIntegracaoService arquivoIntegracaoService;

    @Autowired
    private ViaCepService viaCepService;

    @Transactional
    public Comunidade inserir(Comunidade comunidade, MultipartFile foto) {
        comunidade.setDtCriacao(new java.sql.Date(System.currentTimeMillis()));

        // Valida o CEP e busca cidade/UF no ViaCEP
        ViaCepResponseDTO endereco = viaCepService.buscarCep(comunidade.getCep());

        String cepLimpo = comunidade.getCep().replaceAll("\\D", "");

        comunidade.setCep(cepLimpo);
        comunidade.setCidade(endereco.getLocalidade());
        comunidade.setUf(endereco.getUf());

        if (foto != null && !foto.isEmpty()) {
            try {
                ArquivoResponseDTO arquivo = arquivoIntegracaoService.enviarArquivo(foto);

                if (arquivo == null || arquivo.getUrl() == null ||
                        arquivo.getUrl().isBlank()) {

                    throw new BusinessException(
                            "O serviço de arquivos não retornou a URL da foto.");
                }

                comunidade.setFoto(arquivo.getUrl());
            } catch (RestClientException e) {
                throw new BusinessException("Não foi possível enviar a foto. Verifique o formato e tente novamente.");
            }
        }

        Comunidade objComunidade = comunidadeRepository.save(comunidade);

        // insere na tabela N:N de usuarioComunidade o usuario que criou a comunidade
        if (objComunidade != null) {
            usuarioComunidadeService.inserir(objComunidade.getUsuarioCria(), objComunidade);
        }

        return objComunidade;
    }

    @Transactional
    public Comunidade alterar(Long cdComunidade, Comunidade comunidade, MultipartFile foto) {

        Comunidade objComunidade = comunidadeRepository.findById(cdComunidade)
                .orElseThrow(() -> new ResourceNotFoundException("Comunidade não encontrada."));

        objComunidade.setNmComunidade(comunidade.getNmComunidade());
        objComunidade.setDescricao(comunidade.getDescricao());

        // Valida o CEP novamente e atualiza cidade/UF
        ViaCepResponseDTO endereco = viaCepService.buscarCep(comunidade.getCep());
        String cepLimpo = comunidade.getCep().replaceAll("\\D", "");

        objComunidade.setCep(cepLimpo);
        objComunidade.setCidade(endereco.getLocalidade());
        objComunidade.setUf(endereco.getUf());

        if (foto != null && !foto.isEmpty()) {
            try {

                ArquivoResponseDTO arquivo = arquivoIntegracaoService.enviarArquivo(foto);
                if (arquivo == null || arquivo.getUrl() == null || arquivo.getUrl().isBlank()) {
                    throw new BusinessException("O serviço de arquivos não retornou a URL da foto.");
                }

                objComunidade.setFoto(arquivo.getUrl());

            } catch (RestClientException e) {
                throw new BusinessException("Não foi possível enviar a foto. Verifique o formato e tente novamente.");
            }
        }

        return comunidadeRepository.save(objComunidade);
    }

    @Transactional
    public Comunidade excluir(Long cdComunidade) {
        Comunidade comunidade = comunidadeRepository.findById(cdComunidade)
                .orElseThrow(() -> new ResourceNotFoundException("Comunidade não encontrada."));

        // Deletar nas tabelas N:N
        // corrigir aqui para padronizar chamar o service primeiro
        // this.anuncioComunidadeService.excluirPorComunidade(cdComunidade);
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
                .orElseThrow(() -> new ResourceNotFoundException("Comunidade não encontrada."));
    }

    @Transactional(readOnly = true)
    public List<Comunidade> getComunidadesPorUsuario(Long cdUsuario) {
        return comunidadeRepository.findByUsuarioCria_CdUsuario(cdUsuario);
    }
}