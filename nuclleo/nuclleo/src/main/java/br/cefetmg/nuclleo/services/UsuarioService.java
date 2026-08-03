package br.cefetmg.nuclleo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.UsuarioRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Transactional
    public Usuario inserir(Usuario usuario) {

        usuario.setAtivo(true);

        java.sql.Date data = new java.sql.Date(System.currentTimeMillis());
        usuario.setDtEntrada(data);

        /*
         * if (usuario.existsByNome(dto.getNome())) {
         * throw new BusinessException("Já existe um jogador com esse nome.");
         * }
         * 
         * 
         * //aqui recebe o usuarioRequest e passa para usuári.
         * Jogador jogador = new Jogador();
         * jogador.setNome(dto.getNome());
         * jogador.setNumero(dto.getNumero());
         * jogador.setEquipe(equipe);
         * 
         * return new JogadorResponseDTO(usuarioRepository.save(usuario));
         */
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario alterar(Usuario usuario) {
        /* 
        Jogador jogador = jogadorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Jogador não encontrado. Id: " + id));

        if (jogadorRepository.existsByNomeAndIdNot(dto.getNome(), id)) {
            throw new BusinessException(
                    "Já existe um jogador com esse nome.");
        }

        jogador.setNome(dto.getNome());
        jogador.setNumero(dto.getNumero());
        jogador.setEquipe(equipe);

        return new JogadorResponseDTO(jogadorRepository.save(jogador));
        */
       return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario excluir(Long cdUsuario) {
        //Não apaga o usuário, apenas desativa

        Usuario usuario = usuarioRepository.findById(cdUsuario).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));

            
        try {
            //usuarioRepository.delete(usuario);
            usuario.setAtivo(false);
            usuarioRepository.save(usuario);
            return usuario;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não foi possível excluir o usuário.");
        }
    }

    @Transactional(readOnly = true)
    public Usuario buscarPorId(Long cdUsuario) {
        return usuarioRepository.findById(cdUsuario).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
    }

}
