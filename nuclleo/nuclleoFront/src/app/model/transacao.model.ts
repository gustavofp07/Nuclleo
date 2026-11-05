import { AnuncioModel } from "./anuncio.model";
import { UsuarioModel } from "./usuario.model";

export class TransacaoModel {
    id: number;
    valor: number;
    data: Date;
    status: 'PENDENTE' | 'CONFIRMADA' | 'RECUSADA';
    usuario: UsuarioModel;
    anuncio: AnuncioModel;

    constructor() {
        this.id = 0;
        this.valor = 0;
        this.data = new Date();
        this.status = 'PENDENTE';
        this.usuario = new UsuarioModel();
        this.anuncio = new AnuncioModel();
    }
}
