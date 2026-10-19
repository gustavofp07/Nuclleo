package br.cefetmg.nuclleo.model;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;

class UsuarioTest {

    @Test
    void contaAtivaPodeSerUsada() {
        Usuario usuario = new Usuario();
        usuario.setStatus(Status.ATIVO);
        assertTrue(usuario.isAtivo());
    }

    @Test
    void suspensaoEmAndamentoBloqueiaConta() {
        Usuario usuario = new Usuario();
        usuario.setStatus(Status.SUSPENSO);
        usuario.setSuspensoAte(LocalDateTime.now().plusDays(1));
        assertFalse(usuario.isAtivo());
    }

    @Test
    void suspensaoVencidaLiberaContaMesmoAntesDaRotinaAtualizarOStatus() {
        Usuario usuario = new Usuario();
        usuario.setStatus(Status.SUSPENSO);
        usuario.setSuspensoAte(LocalDateTime.now().minusMinutes(1));
        assertTrue(usuario.isAtivo());
    }

    @Test
    void contaExcluidaNuncaVoltaAFicarAtiva() {
        Usuario usuario = new Usuario();
        usuario.setStatus(Status.EXCLUIDO);
        usuario.setSuspensoAte(LocalDateTime.now().minusDays(1));
        assertFalse(usuario.isAtivo());
    }

    @Test
    void indicaSeCpfECepForamPreenchidos() {
        Usuario usuario = new Usuario();
        assertFalse(usuario.possuiCpf());
        assertFalse(usuario.possuiCep());

        usuario.setCpf("12345678909");
        usuario.setCep("   ");
        assertTrue(usuario.possuiCpf());
        assertFalse(usuario.possuiCep());
    }
}
