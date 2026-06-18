export class UsuarioAutenticadoModel {
    cdUsuario: number;   // opcional (vem do backend)
    nmUsuario: string;
    ftUsuario: string;
    email: string;
    dtEntrada?: Date;

    constructor() {
        this.cdUsuario = 0;//corrigir aqui e no backend
        this.nmUsuario = '';
        this.ftUsuario = '';
        this.email = '';
        this.dtEntrada = new Date();
    }
}
