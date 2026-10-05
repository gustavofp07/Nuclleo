import { UsuarioModel } from "./usuario.model";

export class AnuncioModel {
    cdAnuncio: number;
    nmAnuncio: string;
    descricao: string;
    ftAnuncio: string;
    tipoAnuncio: string;
    habilitado: boolean;
    // e apagar isso aqui
    usuarioCria: UsuarioModel;
    
    dtCriacao?: Date;

    //futuramente usar essa estrutura
    cdUsuarioCria: number;
    /*
    nomeUsuarioCria: string;
    fotoUsuarioCria: string | null;
    */

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