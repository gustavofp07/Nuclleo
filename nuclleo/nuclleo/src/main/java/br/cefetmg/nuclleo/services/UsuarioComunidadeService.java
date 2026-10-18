package br.cefetmg.nuclleo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import br.cefetmg.nuclleo.exception.BadRequestException;
import br.cefetmg.nuclleo.exception.ConflictException;
import br.cefetmg.nuclleo.exception.ResourceNotFoundException;
import br.cefetmg.nuclleo.model.Comunidade;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.model.UsuarioComunidade;
import br.cefetmg.nuclleo.repository.ComunidadeRepository;
import br.cefetmg.nuclleo.repository.UsuarioComunidadeRepository;
import br.cefetmg.nuclleo.repository.UsuarioRepository;

@Service
public class UsuarioComunidadeService {
    @Autowired
    private UsuarioComunidadeRepository repository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ComunidadeRepository comunidadeRepository;

    // Entrar numa comunidade: quem entra é sempre o usuário do token (nunca o que vem no corpo)
    @Transactional
    public UsuarioComunidade entrar(Long cdComunidade, String emailSolicitante) {
        if (cdComunidade == null) {
            throw new BadRequestException("A comunidade é obrigatória.");
        }

        Usuario usuario = usuarioRepository.findByEmail(emailSolicitante)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        Comunidade comunidade = comunidadeRepository.findById(cdComunidade)
                .orElseThrow(() -> new ResourceNotFoundException("Comunidade não encontrada."));

        return inserir(usuario, comunidade);
    }

    @Transactional
    public UsuarioComunidade inserir(Usuario usuario, Comunidade comunidade) {
       boolean existe = repository.existsByUsuarioCdUsuarioAndComunidadeCdComunidade(usuario.getCdUsuario(), comunidade.getCdComunidade());

        if (existe) {
            throw new ConflictException("Usuário já participa desta comunidade.");
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
