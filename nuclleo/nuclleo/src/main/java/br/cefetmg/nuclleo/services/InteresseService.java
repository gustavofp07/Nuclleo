package br.cefetmg.nuclleo.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.cefetmg.nuclleo.dto.InteresseRequestDTO;
import br.cefetmg.nuclleo.model.Anuncio;
import br.cefetmg.nuclleo.model.Interesse;
import br.cefetmg.nuclleo.model.Usuario;
import br.cefetmg.nuclleo.repository.InteresseRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class InteresseService {
    @Autowired
    private InteresseRepository interesseRepository;

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private AnuncioService anuncioService;

    @Transactional
    public Interesse inserir(InteresseRequestDTO dto) {

        Usuario usuario = usuarioService.buscarPorId(dto.getCdUsuario());

        Anuncio anuncio = anuncioService.buscarPorId(dto.getCdAnuncio());

        if (usuario.getCdUsuario() == anuncio.getUsuarioCria().getCdUsuario()) {
            throw new IllegalArgumentException("O usuário não pode demonstrar interesse em seu próprio anúncio.");
        }
        
        Interesse interesse = new Interesse();
        interesse.setUsuario(usuario);
        interesse.setAnuncio(anuncio);
        interesse.setData(new java.sql.Date(System.currentTimeMillis()));
        interesse.setAtivo(true);

        return interesseRepository.save(interesse);
    }

    @Transactional
    public void excluir(Long id) {
        Interesse interesse = interesseRepository.findById(id).orElseThrow(() -> new RuntimeException("Interesse não encontrado. Id: " + id));

        interesseRepository.delete(interesse);
    }

    @Transactional(readOnly = true)
    public Interesse buscarPorId(Long id) {
        return interesseRepository.findById(id).orElseThrow(() -> new RuntimeException("Interesse não encontrado. Id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Interesse> listarPorUsuario(Long id) {
        return interesseRepository.findByUsuarioId(id);
    }

    @Transactional(readOnly = true)
    public List<Interesse> listarPorAnuncio(Long id) {
        return interesseRepository.findByAnuncioId(id);
    }
}
