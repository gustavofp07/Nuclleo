import { UsuarioModel } from "./usuario.model";

export class ComunidadeModel {
    cdComunidade: number;
    descricao: string;
    dtCriacao?: Date;
    nmComunidade: string;
    usuarioCria: UsuarioModel;
    foto?: string;

    cep: string;
    cidade: string;
    uf: string;

    constructor() {
        this.cdComunidade = 0;
        this.descricao = '';
        this.nmComunidade = '';
        this.usuarioCria = new UsuarioModel();
        this.foto = '';

        this.cep = '';
        this.cidade = '';
        this.uf = '';
    }
}
