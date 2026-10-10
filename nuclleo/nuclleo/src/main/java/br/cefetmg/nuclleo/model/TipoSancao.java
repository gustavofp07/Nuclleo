package br.cefetmg.nuclleo.model;

public enum TipoSancao {
    SUSPENSAO,  // bloqueio temporário (1 a 7 dias)
    REATIVACAO, // o administrador retirou a suspensão antes do prazo
    EXCLUSAO    // exclusão lógica definitiva
}
