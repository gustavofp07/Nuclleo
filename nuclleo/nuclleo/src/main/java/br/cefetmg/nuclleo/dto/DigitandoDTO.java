package br.cefetmg.nuclleo.dto;

public class DigitandoDTO {

    private Long cdUsuario;
    private boolean digitando;

    public Long getCdUsuario() {
        return cdUsuario;
    }

    public void setCdUsuario(Long cdUsuario) {
        this.cdUsuario = cdUsuario;
    }

    public boolean isDigitando() {
        return digitando;
    }

    public void setDigitando(boolean digitando) {
        this.digitando = digitando;
    }
}