package br.cefetmg.nuclleo.dto;

public class InteresseStatusDTO {

    private boolean finalizado;
    private boolean avaliacaoInteressadoFeita;
    private boolean avaliacaoAnuncianteFeita;
    private boolean aceito;
    private boolean conversaIniciada;

    public InteresseStatusDTO() {
    }

    public InteresseStatusDTO(boolean finalizado, boolean avaliacaoInteressadoFeita,
            boolean avaliacaoAnuncianteFeita, boolean aceito, boolean conversaIniciada) {
        this.finalizado = finalizado;
        this.avaliacaoInteressadoFeita = avaliacaoInteressadoFeita;
        this.avaliacaoAnuncianteFeita = avaliacaoAnuncianteFeita;
        this.aceito = aceito;
        this.conversaIniciada = conversaIniciada;
    }

    public boolean isFinalizado() {
        return finalizado;
    }

    public void setFinalizado(boolean finalizado) {
        this.finalizado = finalizado;
    }

    public boolean isAvaliacaoInteressadoFeita() {
        return avaliacaoInteressadoFeita;
    }

    public void setAvaliacaoInteressadoFeita(boolean avaliacaoInteressadoFeita) {
        this.avaliacaoInteressadoFeita = avaliacaoInteressadoFeita;
    }

    public boolean isAvaliacaoAnuncianteFeita() {
        return avaliacaoAnuncianteFeita;
    }

    public void setAvaliacaoAnuncianteFeita(boolean avaliacaoAnuncianteFeita) {
        this.avaliacaoAnuncianteFeita = avaliacaoAnuncianteFeita;
    }

    public boolean isAceito() {
        return aceito;
    }

    public void setAceito(boolean aceito) {
        this.aceito = aceito;
    }

    public boolean isConversaIniciada() {
        return conversaIniciada;
    }

    public void setConversaIniciada(boolean conversaIniciada) {
        this.conversaIniciada = conversaIniciada;
    }
}