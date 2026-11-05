package br.cefetmg.nuclleo.model;

/**
 * Situação de uma transação registrada pelo anunciante.
 *
 * PENDENTE   -> aguardando o interessado validar.
 * CONFIRMADA -> validada pelos dois lados: faz parte do histórico.
 * RECUSADA   -> o interessado disse que está errada: fica fora do histórico.
 */
public enum StatusTransacao {
    PENDENTE,
    CONFIRMADA,
    RECUSADA
}
