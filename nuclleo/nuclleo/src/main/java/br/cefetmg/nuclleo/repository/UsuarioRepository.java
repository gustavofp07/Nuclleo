package br.cefetmg.nuclleo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.cefetmg.nuclleo.model.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {}
