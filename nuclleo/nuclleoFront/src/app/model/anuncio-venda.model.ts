import { AnuncioModel } from "./anuncio.model";

export class AnuncioVendaModel extends AnuncioModel {
    ftAnuncio: string;
    valor: number;

    constructor() {
        super();

        this.ftAnuncio = '';
        this.valor = 0;
    }
}
