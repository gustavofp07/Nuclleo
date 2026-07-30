package br.cefetmg.nuclleo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.cefetmg.nuclleo.dto.TransacaoRequestDTO;
import br.cefetmg.nuclleo.model.Transacao;
import br.cefetmg.nuclleo.services.TransacaoService;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/transacoes")
@Tag(name = "Transações", description = "Operações relacionadas a transações")
public class TransacaoController {
    @Autowired
    private TransacaoService transacaoService;

    @PostMapping("")
    public void inserir(@RequestBody TransacaoRequestDTO dto) {
        if (dto.getValor() <= 0) {
            throw new IllegalArgumentException("O valor da transação deve ser maior que zero.");
        }

        if (dto.getCdUsuario() == null) {
            throw new IllegalArgumentException("O ID do usuário não pode ser nulo.");
        }

        if (dto.getCdAnuncio() == null) {
            throw new IllegalArgumentException("O ID do anúncio não pode ser nulo.");
        }

        transacaoService.inserir(dto);
    }

    @GetMapping("")
    public List<Transacao> listarTodos() {
        return transacaoService.listarTodos();
    }

    @GetMapping("/{id}")
    public Transacao buscarPorId(Long id) {
        return transacaoService.buscarPorId(id);
    }

    @GetMapping("/usuario/{id}")
    public List<Transacao> listarPorUsuario(Long id) {
        return transacaoService.listarPorUsuario(id);
    }

    @GetMapping("/anuncio/{id}")
    public List<Transacao> listarPorAnuncio(Long id) {
        return transacaoService.listarPorAnuncio(id);
    }

    @DeleteMapping("/{id}")
    public void excluir(Long id) {
        transacaoService.excluir(id);
    }
}