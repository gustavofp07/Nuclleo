import { ComunidadeModel } from "./comunidade.model";
import { UsuarioModel } from "./usuario.model";

export class UsuarioComunidadeModel {
    codigo: number;
    usuario: UsuarioModel;
    comunidade: ComunidadeModel;

    constructor() {
        this.codigo = 0;
        this.usuario = new UsuarioModel();
        this.comunidade = new ComunidadeModel();
    }
}
