import { AnuncioModel } from "./anuncio.model";
import { UsuarioModel } from "./usuario.model";

export class InteresseModel {
    id: number;
    usuario: UsuarioModel;
    anuncio: AnuncioModel;
    dataInteresse: Date;

    constructor() {
        this.id = 0;
        this.usuario = new UsuarioModel();
        this.anuncio = new AnuncioModel();
        this.dataInteresse = new Date();
    }
}
