package br.cefetmg.nuclleo.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.cefetmg.nuclleo.exception.BusinessException;
import br.cefetmg.nuclleo.model.AnuncioRequerimento;
import br.cefetmg.nuclleo.model.AnuncioVenda;
import br.cefetmg.nuclleo.repository.AnuncioRequerimentoRepository;
import br.cefetmg.nuclleo.repository.AnuncioVendaRepository;

/** RN07: as regras dos anúncios valem na API, não só no aplicativo. */
@ExtendWith(MockitoExtension.class)
class AnuncioValidacaoTest {

    @Mock
    private AnuncioVendaRepository vendaRepository;

    @Mock
    private AnuncioRequerimentoRepository requerimentoRepository;

    @InjectMocks
    private AnuncioVendaService vendaService;

    @InjectMocks
    private AnuncioRequerimentoService requerimentoService;

    private AnuncioVenda venda(String titulo, String descricao, double valor) {
        AnuncioVenda anuncio = new AnuncioVenda();
        anuncio.setNmAnuncio(titulo);
        anuncio.setDescricao(descricao);
        anuncio.setValor(valor);
        return anuncio;
    }

    private AnuncioRequerimento compra(String minimo, String maximo) {
        AnuncioRequerimento anuncio = new AnuncioRequerimento();
        anuncio.setNmAnuncio("Procuro bicicleta");
        anuncio.setDescricao("Aro 29");
        anuncio.setValorMin(minimo == null ? null : new BigDecimal(minimo));
        anuncio.setValorMax(maximo == null ? null : new BigDecimal(maximo));
        return anuncio;
    }

    private void vendaInvalida(AnuncioVenda anuncio, String mensagem) {
        BusinessException erro = assertThrows(BusinessException.class, () -> vendaService.inserir(anuncio, null));
        assertEquals(mensagem, erro.getMessage());
        verify(vendaRepository, never()).save(any());
    }

    private void compraInvalida(AnuncioRequerimento anuncio, String mensagem) {
        BusinessException erro = assertThrows(BusinessException.class, () -> requerimentoService.inserir(anuncio, null));
        assertEquals(mensagem, erro.getMessage());
        verify(requerimentoRepository, never()).save(any());
    }

    @Test
    void vendaValidaESalva() {
        AnuncioVenda anuncio = venda("Bicicleta", "Aro 29", 0.01);
        when(vendaRepository.save(anuncio)).thenReturn(anuncio);

        assertSame(anuncio, vendaService.inserir(anuncio, null));
    }

    @Test
    void vendaPrecisaDeTituloDescricaoEPreco() {
        vendaInvalida(venda("  ", "Aro 29", 10), "O título do anúncio é obrigatório.");
        vendaInvalida(venda("Bicicleta", null, 10), "A descrição do anúncio é obrigatória.");
        vendaInvalida(venda("Bicicleta", "Aro 29", 0), "O preço deve ser maior que zero.");
        vendaInvalida(venda("Bicicleta", "Aro 29", -5), "O preço deve ser maior que zero.");
    }

    @Test
    void compraValidaESalva() {
        AnuncioRequerimento anuncio = compra("100.00", "100.01");
        when(requerimentoRepository.save(anuncio)).thenReturn(anuncio);

        assertSame(anuncio, requerimentoService.inserir(anuncio, null));
    }

    @Test
    void compraPrecisaDeFaixaDePrecoValida() {
        compraInvalida(compra(null, "100"), "Os preços mínimo e máximo são obrigatórios.");
        compraInvalida(compra("100", null), "Os preços mínimo e máximo são obrigatórios.");
        compraInvalida(compra("0", "100"), "O preço mínimo deve ser maior que zero.");
        compraInvalida(compra("100", "100"), "O preço máximo deve ser maior que o mínimo.");
        compraInvalida(compra("100.00", "99.99"), "O preço máximo deve ser maior que o mínimo.");
    }

    @Test
    void edicaoTambemValida() {
        assertThrows(BusinessException.class, () -> vendaService.alterar(venda("Bicicleta", "Aro 29", 0), null, "a@b.com"));
        assertThrows(BusinessException.class, () -> requerimentoService.alterar(compra("100", "50"), null, "a@b.com"));
    }
}
