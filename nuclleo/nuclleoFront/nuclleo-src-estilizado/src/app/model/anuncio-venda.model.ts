import { AnuncioModel } from "./anuncio.model";

export class AnuncioVendaModel extends AnuncioModel {
    valor: number;

    constructor() {
        super();

        this.valor = 0;
    }
}
