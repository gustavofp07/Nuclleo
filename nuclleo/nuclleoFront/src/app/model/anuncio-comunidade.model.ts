import { AnuncioModel } from "./anuncio.model";
import { ComunidadeModel } from "./comunidade.model";

export class AnuncioComunidadeModel {
    anuncio!: AnuncioModel;
    comunidade: ComunidadeModel;

    constructor() {
        this.anuncio = new AnuncioModel();
        this.comunidade = new ComunidadeModel();
    }
}
