package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.cefetmg.nuclleo.model.Transacao;
import br.cefetmg.nuclleo.services.TransacaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Transações são só de leitura pela API: elas nascem quando o anunciante finaliza
 * a conversa (InteresseService.finalizarConversa) e cada um só vê as suas.
 */
@RestController
@RequestMapping("/transacoes")
@CrossOrigin(origins = "*")
@Tag(name = "Transações", description = "Operações relacionadas a transações")
public class TransacaoController {
    @Autowired
    private TransacaoService transacaoService;

    @GetMapping("/{id}")
    @Operation(summary = "Buscar transação (somente quem participou dela)")
    public Transacao buscarPorId(@PathVariable Long id, Authentication authentication) {
        return transacaoService.buscarPorId(id, authentication.getName());
    }

    @GetMapping("/usuario/{id}")
    @Operation(summary = "Listar as transações do usuário logado")
    public List<Transacao> listarPorUsuario(@PathVariable Long id, Authentication authentication) {
        return transacaoService.listarPorUsuarioEnvolvido(id, authentication.getName());
    }

    @GetMapping("/anuncio/{id}")
    @Operation(summary = "Listar as transações de um anúncio (somente o dono do anúncio)")
    public List<Transacao> listarPorAnuncio(@PathVariable Long id, Authentication authentication) {
        return transacaoService.listarPorAnuncio(id, authentication.getName());
    }
}
