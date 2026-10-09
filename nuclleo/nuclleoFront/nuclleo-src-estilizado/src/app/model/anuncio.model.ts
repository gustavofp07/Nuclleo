import { UsuarioModel } from "./usuario.model";

export class AnuncioModel {
    cdAnuncio: number;
    nmAnuncio: string;
    descricao: string;
    ftAnuncio: string;
    tipoAnuncio: string;
    habilitado: boolean;

    usuarioCria: UsuarioModel;

    dtCriacao?: Date;

    cdUsuarioCria: number;

    constructor() {
        this.cdAnuncio = 0;
        this.nmAnuncio = '';
        this.descricao = '';
        this.ftAnuncio = '';
        this.tipoAnuncio = '';
        this.habilitado = true;
        this.cdUsuarioCria = 0;
        this.usuarioCria = new UsuarioModel();
    }
}
