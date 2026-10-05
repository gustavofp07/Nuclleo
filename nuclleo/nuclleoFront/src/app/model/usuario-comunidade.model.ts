import { ComunidadeModel } from "./comunidade.model";
import { UsuarioModel } from "./usuario.model";

export class UsuarioComunidadeModel {
    codigo: number;
    usuario: UsuarioModel;
    comunidade: ComunidadeModel;

    //futuramente usar essa implementação
    /*
    cdUsuario: number;
    nmUsuario: string;
    cdComunidade: number;
    nmComunidade: string;
    */

    constructor() {
        this.codigo = 0;
        this.usuario = new UsuarioModel();
        this.comunidade = new ComunidadeModel();
    }
}
