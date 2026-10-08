package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.cefetmg.nuclleo.model.Avaliacao;
import br.cefetmg.nuclleo.services.AvaliacaoService;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/avaliacoes")
@CrossOrigin(origins = "*")
@Tag(name = "Avaliações", description = "Operações relacionadas a avaliações")
public class AvaliacaoController {
    @Autowired
    private AvaliacaoService avaliacaoService;

    // Lista avaliações pendentes de um usuário
    @GetMapping("/pendentes/{cdUsuario}")
    public ResponseEntity<List<Avaliacao>> listarPendentes(@PathVariable Long cdUsuario) {
        return ResponseEntity.ok(avaliacaoService.listarPendentes(cdUsuario));
    }

    // Lista avaliações recebidas por um usuário (reputação)
    @GetMapping("/recebidas/{cdUsuario}")
    public ResponseEntity<List<Avaliacao>> listarRecebidas(@PathVariable Long cdUsuario) {
        return ResponseEntity.ok(avaliacaoService.listarRecebidas(cdUsuario));
    }

    // Lista avaliações de uma transação
    @GetMapping("/transacao/{cdTransacao}")
    public ResponseEntity<List<Avaliacao>> listarPorTransacao(@PathVariable Long cdTransacao) {
        return ResponseEntity.ok(avaliacaoService.listarPorTransacao(cdTransacao));
    }

    @GetMapping("/media/{cdUsuario}")
    public ResponseEntity<Float> media(@PathVariable Long cdUsuario) {
        return ResponseEntity.ok(avaliacaoService.calcularAvaliacao(cdUsuario));
    }

    // Quantidade de avaliações recebidas por um usuário
    @GetMapping("/total/{cdUsuario}")
    public ResponseEntity<Long> total(@PathVariable Long cdUsuario) {
        return ResponseEntity.ok(avaliacaoService.contarAvaliacoes(cdUsuario));
    }

    // Registra a nota de uma avaliação pendente
    @PatchMapping("/{cdAvaliacao}/nota")
    public ResponseEntity<Avaliacao> avaliar(
            @PathVariable Long cdAvaliacao,
            @RequestParam Long cdAvaliador,
            @RequestParam Integer nota) {
        return ResponseEntity.ok(avaliacaoService.avaliar(cdAvaliacao, cdAvaliador, nota));
    }
}