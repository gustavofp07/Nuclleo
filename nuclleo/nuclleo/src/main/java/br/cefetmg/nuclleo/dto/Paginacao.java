package br.cefetmg.nuclleo.dto;

/**
 * Limites das listagens paginadas: o cliente escolhe o tamanho da página,
 * mas nunca acima do máximo (evita alguém pedir a base inteira de uma vez).
 */
public final class Paginacao {

    public static final int PADRAO = 20;
    public static final int MAXIMO = 100;

    private Paginacao() {
    }

    public static int limitar(int tamanho) {
        if (tamanho <= 0) {
            return PADRAO;
        }
        return Math.min(tamanho, MAXIMO);
    }
}
