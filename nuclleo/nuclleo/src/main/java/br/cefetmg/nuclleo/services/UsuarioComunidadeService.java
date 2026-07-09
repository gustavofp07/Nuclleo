package br.cefetmg.nuclleo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.transaction.annotation.Transactional;

import br.cefetmg.nuclleo.model.Comunidade;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.model.UsuarioComunidade;
import br.cefetmg.nuclleo.repository.UsuarioComunidadeRepository;

@Service
public class UsuarioComunidadeService {
    @Autowired
    private UsuarioComunidadeRepository repository;

    @Transactional
    public UsuarioComunidade inserir(UsuarioComunidade dto) {

        /*
        if (equipeRepository.existsByNome(dto.getNome())){
            throw new BusinessException("Já existe uma equipe com esse nome.");
        }

        Modalidade modalidade = modalidadeRepository.findById(dto.getModalidadeId())
                .orElseThrow(() -> new ResourceNotFoundException("Modalidade não encontrada. Id: " + dto.getModalidadeId()));

        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrada. Id: " + dto.getUsuarioId()));
        */

        Long cdUsuario = dto.getUsuario().getCdUsuario();
        Long cdComunidade = dto.getComunidade().getCdComunidade();

        boolean existe = repository.existsByUsuarioCdUsuarioAndComunidadeCdComunidade(cdUsuario, cdComunidade);

        if (existe) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Usuário já participa desta comunidade.");
        }

        UsuarioComunidade usuarioComunidade = new UsuarioComunidade();
        usuarioComunidade.setUsuario(dto.getUsuario());
        usuarioComunidade.setComunidade(dto.getComunidade());

        return repository.save(usuarioComunidade);
    }

    @Transactional
    public UsuarioComunidade inserir(Usuario usuario, Comunidade comunidade) {
       boolean existe = repository.existsByUsuarioCdUsuarioAndComunidadeCdComunidade(usuario.getCdUsuario(), comunidade.getCdComunidade());

        if (existe) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Usuário já participa desta comunidade.");
        }

        UsuarioComunidade usuarioComunidade = new UsuarioComunidade();
        usuarioComunidade.setUsuario(usuario);
        usuarioComunidade.setComunidade(comunidade);

        return repository.save(usuarioComunidade);
    }

    @Transactional(readOnly = true)
    public List<UsuarioComunidade> listar() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<UsuarioComunidade> listarPorUsuario(Long cdUsuario) {
        return repository.findByUsuarioCdUsuario(cdUsuario);
    }

    @Transactional(readOnly = true)
    public List<UsuarioComunidade> listarPorComunidade(Long cdComunidade) {
        return repository.findByComunidadeCdComunidade(cdComunidade);
    }

    @Transactional
    public void excluirPorComunidade(Long cdComunidade) {
        repository.deleteByComunidadeCdComunidade(cdComunidade);
    }

    @Transactional
    public void excluirPorUsuario(Long cdUsuario) {
        repository.deleteByUsuarioCdUsuario(cdUsuario);
    }

    @Transactional
    public void excluirRelacaoEspecifica(Long cdUsuario, Long cdComunidade) {
        repository.deleteByUsuarioCdUsuarioAndComunidadeCdComunidade(cdUsuario, cdComunidade);
    }

}
