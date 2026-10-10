package br.cefetmg.nuclleo.model;

/**
 * Motivos fixos de denúncia. O front deve exibir a mesma lista.
 * Quando o motivo for OUTRO, a descrição passa a ser obrigatória.
 */
public enum MotivoDenuncia {
    GOLPE_FRAUDE,
    PRODUTO_PROIBIDO,
    INFORMACAO_FALSA,
    CONTEUDO_OFENSIVO,
    ASSEDIO,
    SPAM_DUPLICADO,
    PERFIL_FALSO,
    OUTRO
}
