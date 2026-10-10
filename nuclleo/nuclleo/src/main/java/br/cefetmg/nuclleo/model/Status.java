package br.cefetmg.nuclleo.model;

/**
 * Situação de uma conta de usuário ou de um anúncio.
 *
 * ATIVO     -> visível e utilizável normalmente.
 * SUSPENSO  -> bloqueado temporariamente (até a data em "suspensoAte").
 * EXCLUIDO  -> excluído de forma lógica. É um estado FINAL:
 *              depois de EXCLUIDO, nunca mais volta a ATIVO ou SUSPENSO.
 */
public enum Status {
    ATIVO,
    SUSPENSO,
    EXCLUIDO
}
