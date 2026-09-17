package br.cefetmg.nuclleo.dto;

public class InteresseStatusDTO {

    private boolean finalizado;
    private boolean avaliacaoInteressadoFeita; 
    private boolean avaliacaoAnuncianteFeita;

    public InteresseStatusDTO() {
    }

    public InteresseStatusDTO(boolean finalizado, boolean avaliacaoInteressadoFeita,
            boolean avaliacaoAnuncianteFeita) {
        this.finalizado = finalizado;
        this.avaliacaoInteressadoFeita = avaliacaoInteressadoFeita;
        this.avaliacaoAnuncianteFeita = avaliacaoAnuncianteFeita;
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
}