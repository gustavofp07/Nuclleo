import { UsuarioModel } from "./usuario.model";

export class ComunidadeModel {
    cdComunidade: number;
    descricao: string;
    dtCriacao?: Date;
    nmComunidade: string;
    //cdUsuarioCria: number;
    usuarioCria: UsuarioModel;
    foto?: string;

    constructor() {
        this.cdComunidade = 0;
        this.descricao = '';
        this.nmComunidade = '';
        //this.cdUsuarioCria = 0;
        this.usuarioCria = new UsuarioModel();
        this.foto = '';
    }

}