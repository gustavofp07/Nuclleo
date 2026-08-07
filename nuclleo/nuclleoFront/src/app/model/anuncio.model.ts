import { UsuarioModel } from "./usuario.model";

export class AnuncioModel {
    cdAnuncio: number;
    nmAnuncio: string;
    descricao: string;
    tipoAnuncio: string;
    habilitado: boolean;
    usuarioCria: UsuarioModel;

    constructor() {
        this.cdAnuncio = 0;
        this.nmAnuncio = '';
        this.descricao = '';
        this.tipoAnuncio = '';
        this.habilitado = true;
        this.usuarioCria = new UsuarioModel();
    }
}