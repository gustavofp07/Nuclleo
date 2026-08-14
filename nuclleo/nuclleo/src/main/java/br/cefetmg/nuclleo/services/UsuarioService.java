package br.cefetmg.nuclleo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import br.cefetmg.nuclleo.dto.ArquivoResponseDTO;
import br.cefetmg.nuclleo.exception.DatabaseException;
import br.cefetmg.nuclleo.exception.ResourceNotFoundException;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.UsuarioRepository;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UsuarioService {
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ArquivoIntegracaoService arquivoIntegracaoService;

    @Transactional
    public Usuario inserir(Usuario usuario) {

        usuario.setAtivo(true);

        java.sql.Date data = new java.sql.Date(System.currentTimeMillis());
        usuario.setDtEntrada(data);

    
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario alterar(Usuario dto, MultipartFile foto) {
        Usuario usuario = usuarioRepository.findById(dto.getCdUsuario()).orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        usuario.setNmUsuario(dto.getNmUsuario());
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(dto.getSenha());
        usuario.setCpf(dto.getCpf());
        usuario.setCep(dto.getCep());
        usuario.setTelefone(dto.getTelefone());

        if (foto != null && !foto.isEmpty()) {
            ArquivoResponseDTO arquivo = arquivoIntegracaoService.enviarArquivo(foto);

            usuario.setFtUsuario(arquivo.getUrl());
        }

        Usuario usuarioAlterado = usuarioRepository.save(usuario);
        return usuarioAlterado;
    }

    @Transactional
    public Usuario excluir(Long cdUsuario) {
        // Não apaga o usuário, apenas desativa

        Usuario usuario = usuarioRepository.findById(cdUsuario).orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        try {
            // usuarioRepository.delete(usuario);
            usuario.setAtivo(false);
            usuarioRepository.save(usuario);
            return usuario;
        } catch (DataAccessException e) {
            throw new DatabaseException("Não foi possível excluir o usuário.");
        }
    }

    @Transactional(readOnly = true)
    public Usuario buscarPorId(Long cdUsuario) {
        return usuarioRepository.findById(cdUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
    }

}
