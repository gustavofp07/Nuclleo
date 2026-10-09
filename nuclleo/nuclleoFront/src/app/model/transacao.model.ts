import { AnuncioModel } from "./anuncio.model";
import { UsuarioModel } from "./usuario.model";

export class TransacaoModel {
    id: number;
    valor: number;
    data: Date;
    usuario: UsuarioModel;
    anuncio: AnuncioModel;

    constructor() {
        this.id = 0;
        this.valor = 0;
        this.data = new Date();
        this.usuario = new UsuarioModel();
        this.anuncio = new AnuncioModel();
    }
}
