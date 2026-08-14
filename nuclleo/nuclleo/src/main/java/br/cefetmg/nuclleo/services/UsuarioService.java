package br.cefetmg.nuclleo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;

import br.cefetmg.nuclleo.dto.ArquivoResponseDTO;
import br.cefetmg.nuclleo.exception.BusinessException;
import br.cefetmg.nuclleo.exception.DatabaseException;
import br.cefetmg.nuclleo.exception.ResourceNotFoundException;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.UsuarioRepository;

@Service
public class UsuarioService {
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ArquivoIntegracaoService arquivoIntegracaoService;

    @Transactional
    public Usuario inserir(Usuario usuario) {
        usuario.setAtivo(true);
        usuario.setDtEntrada(new java.sql.Date(System.currentTimeMillis()));
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario alterar(Usuario dto, MultipartFile foto) {
        Usuario usuario = usuarioRepository.findById(dto.getCdUsuario())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        usuario.setNmUsuario(dto.getNmUsuario());
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(dto.getSenha());
        usuario.setCpf(dto.getCpf());
        usuario.setCep(dto.getCep());
        usuario.setTelefone(dto.getTelefone());

        if (foto != null && !foto.isEmpty()) {
            try {
                ArquivoResponseDTO arquivo = arquivoIntegracaoService.enviarArquivo(foto);

                if (arquivo == null || arquivo.getUrl() == null ||
                        arquivo.getUrl().isBlank()) {
                    throw new BusinessException(
                            "O serviço de arquivos não retornou a URL da foto.");
                }

                usuario.setFtUsuario(arquivo.getUrl());
                
            } catch (RestClientException e) {
                throw new BusinessException(
                        "Não foi possível enviar a foto. Verifique o formato e tente novamente.");
            }
        }

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario excluir(Long cdUsuario) {
        Usuario usuario = usuarioRepository.findById(cdUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        try {
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
