package br.cefetmg.nuclleo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.cefetmg.nuclleo.model.Anuncio;

@Repository
public interface AnuncioRepository extends JpaRepository<Anuncio, Long> {

    //listar os anúncios de um usuário
    List<Anuncio>findByUsuarioCria_CdUsuario(Long cdUsuario);

}
