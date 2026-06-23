package br.cefetmg.nuclleo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import br.cefetmg.nuclleo.model.Comunidade;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.model.UsuarioComunidade;
import br.cefetmg.nuclleo.repository.UsuarioComunidadeRepository;
import jakarta.transaction.Transactional;

@Service
public class UsuarioComunidadeService {
    @Autowired
    private UsuarioComunidadeRepository usuarioComunidadeRepository;

    @Transactional
    public UsuarioComunidade inserir(Usuario usuario, Comunidade comunidade) {
        UsuarioComunidade usuarioComunidade = new UsuarioComunidade();
        usuarioComunidade.setUsuario(usuario);
        usuarioComunidade.setComunidade(comunidade);

        Long cdUsuario = usuarioComunidade.getUsuario().getCdUsuario();
        Long cdComunidade = usuarioComunidade.getComunidade().getCdComunidade();

        boolean existe = usuarioComunidadeRepository.existsByUsuarioCdUsuarioAndComunidadeCdComunidade(cdUsuario, cdComunidade);

        if (existe) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Usuário já participa desta comunidade.");
        }

        usuarioComunidade.setId(null);
        return usuarioComunidadeRepository.save(usuarioComunidade);
    }

    @Transactional
    public void excluirPorComunidade(Long cdComunidade) {
        usuarioComunidadeRepository.deleteByComunidadeCdComunidade(cdComunidade);
    }

}
