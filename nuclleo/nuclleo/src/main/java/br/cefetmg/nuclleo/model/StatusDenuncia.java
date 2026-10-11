package br.cefetmg.nuclleo.model;
//ver a nessidade disso aqui
public enum StatusDenuncia {
    PENDENTE,     // ainda não foi analisada por um administrador
    PROCEDENTE,   // o administrador concordou com a denúncia
    IMPROCEDENTE  // o administrador analisou e descartou a denúncia
}
