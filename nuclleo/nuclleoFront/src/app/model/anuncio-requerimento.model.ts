import { AnuncioModel } from "./anuncio.model";

export class AnuncioRequerimentoModel extends AnuncioModel {
    ftAnuncio: string;
    valorMin: number;
    valorMax: number;

    constructor() {
        super();

        this.ftAnuncio = '';
        this.valorMin = 0;
        this.valorMax = 0;
    }
}
