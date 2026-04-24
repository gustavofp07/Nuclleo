package br.cefetmg.nuclleo.model;

public class Anuncio {
    Long cdAnuncio;
    String ftAnuncio;
    String nmAnuncio;
    //boolean tipo;
    public enum tipo {
        VENDA, REQUERIMENTO
    }
    boolean habilitado;
    String descricao;
    double valor;
    
    Long cdUsuario;
}
