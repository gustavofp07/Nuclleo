package br.cefetmg.nuclleo.exception;

/**
 * O usuário está autenticado, mas não tem permissão para fazer a ação
 * (ex.: tentar excluir a conta ou o anúncio de outra pessoa). Gera HTTP 403.
 */
public class ForbiddenException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ForbiddenException(String message) {
        super(message);
    }
}
