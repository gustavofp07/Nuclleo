package br.cefetmg.nuclleo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;

import br.cefetmg.nuclleo.dto.ArquivoResponseDTO;
import br.cefetmg.nuclleo.dto.UsuarioRequestDTO;
import br.cefetmg.nuclleo.dto.ViaCepResponseDTO;
import br.cefetmg.nuclleo.exception.BusinessException;
import br.cefetmg.nuclleo.exception.DatabaseException;
import br.cefetmg.nuclleo.exception.ResourceNotFoundException;
import br.cefetmg.nuclleo.model.Perfil;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.UsuarioRepository;

@Service
public class UsuarioService {
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ArquivoIntegracaoService arquivoIntegracaoService;

    @Autowired
    private ViaCepService viaCepService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public Usuario inserir(UsuarioRequestDTO dto, MultipartFile foto) {
        Usuario usuario = new Usuario();
        usuario.setNmUsuario(dto.getNmUsuario());
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(passwordEncoder.encode(dto.getSenha()));

        usuario.setAtivo(true);
        usuario.setDtEntrada(new java.sql.Date(System.currentTimeMillis()));
        usuario.setPerfil(Perfil.USUARIO);

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
                throw new BusinessException("Não foi possível enviar a foto. Verifique o formato e tente novamente.");
            }
        }

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario alterar(Usuario dto, MultipartFile foto) {
        Usuario usuario = usuarioRepository.findById(dto.getCdUsuario())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        usuario.setNmUsuario(dto.getNmUsuario());
        usuario.setEmail(dto.getEmail());

        usuario.setCpf(dto.getCpf());
        usuario.setTelefone(dto.getTelefone());

        // o CEP não é obrigatório, mas se for informado, deve ser validado e preenchido
        if (dto.getCep() != null && !dto.getCep().isBlank()) {
            ViaCepResponseDTO endereco = viaCepService.buscarCep(dto.getCep());
            String cepLimpo = dto.getCep().replaceAll("\\D", "");

            usuario.setCep(cepLimpo);
            usuario.setCidade(endereco.getLocalidade());
            usuario.setUf(endereco.getUf());
        } else {
            usuario.setCep(null);
            usuario.setCidade(null);
            usuario.setUf(null);
        }

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
    public void alterarSenha(String email, String senhaAtual, String novaSenha) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        if (!passwordEncoder.matches(senhaAtual, usuario.getSenha())) {
            throw new BusinessException("Senha atual incorreta.");
        }

        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);
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

    @Transactional(readOnly = true)
    public boolean verificarEmail(String email) {
        if (email == null || email.isBlank()) {
            return false;
        }

        return usuarioRepository.existsByEmail(email);
    }

    @Transactional(readOnly = true)
    public boolean verificarEmail(String email, Long cdUsuario) {

        if (email == null || email.isBlank()) {
            return false;
        }

        if (cdUsuario == null) {
            // estamos verificando um novo usuário
            return usuarioRepository.existsByEmail(email);
        } else {
            // estamos verificando um usuário existente
            return usuarioRepository.existsByEmailAndCdUsuarioNot(email, cdUsuario);
        }
    }

    @Transactional(readOnly = true)
    public boolean verificarCep(Long cdUsuario) {
        Usuario usuario = usuarioRepository.findById(cdUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        return (usuario.getCep() != null && !usuario.getCep().isBlank());
    }

    @Transactional(readOnly = true)
    public boolean verificarCpf(Long cdUsuario) {

        Usuario usuario = usuarioRepository.findById(cdUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        return (usuario.getCpf() != null && !usuario.getCpf().isBlank());
    }

    // Administrador
    @Transactional
    public Usuario inserirAdmin(UsuarioRequestDTO dto, MultipartFile foto) {
        Usuario usuario = new Usuario();
        usuario.setNmUsuario(dto.getNmUsuario());
        usuario.setEmail(dto.getEmail());
        usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        usuario.setAtivo(true);
        usuario.setDtEntrada(new java.sql.Date(System.currentTimeMillis()));
        usuario.setPerfil(Perfil.ADMINISTRADOR);

        if (foto != null && !foto.isEmpty()) {
            try {
                ArquivoResponseDTO arquivo = arquivoIntegracaoService.enviarArquivo(foto);
                if (arquivo == null || arquivo.getUrl() == null || arquivo.getUrl().isBlank()) {
                    throw new BusinessException("O serviço de arquivos não retornou a URL da foto.");
                }
                usuario.setFtUsuario(arquivo.getUrl());
            } catch (RestClientException e) {
                throw new BusinessException("Não foi possível enviar a foto.");
            }
        }

        return usuarioRepository.save(usuario);
    }
}