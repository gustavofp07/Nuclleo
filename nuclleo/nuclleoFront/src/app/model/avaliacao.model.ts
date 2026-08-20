import { UsuarioModel } from "./usuario.model";

export class AvaliacaoModel {
    cdAvaliacao: number;
    avaliador: UsuarioModel;
    avaliado: UsuarioModel;
    nota: number | null;
    dtAvaliacao: Date | null;

    constructor() {
        this.cdAvaliacao = 0;
        this.avaliador = new UsuarioModel();
        this.avaliado = new UsuarioModel();
        this.nota = null;
        this.dtAvaliacao = null;
    }
}