import { AnuncioModel } from "./anuncio.model";

export class AnuncioRequerimentoModel extends AnuncioModel {
    valorMin: number;
    valorMax: number;

    constructor() {
        super();

        this.valorMin = 0;
        this.valorMax = 0;
    }
}
