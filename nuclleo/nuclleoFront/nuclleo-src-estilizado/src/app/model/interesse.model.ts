import { AnuncioModel } from "./anuncio.model";
import { UsuarioModel } from "./usuario.model";

export class InteresseModel {
    id: number;
    usuario: UsuarioModel;
    anuncio: AnuncioModel;
    dataInteresse: Date;
    finalizado: boolean;
    aceito: boolean;
    conversaIniciada: boolean;
    avaliacaoInteressadoFeita: boolean;
    avaliacaoAnuncianteFeita: boolean;

    constructor() {
        this.id = 0;
        this.usuario = new UsuarioModel();
        this.anuncio = new AnuncioModel();
        this.dataInteresse = new Date();
        this.finalizado = false;
        this.aceito = false;
        this.conversaIniciada = false;
        this.avaliacaoInteressadoFeita = false;
        this.avaliacaoAnuncianteFeita = false;
    }
}
