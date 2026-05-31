export class UsuarioModel {
    cdUsuario: number;   // opcional (vem do backend)
    nmUsuario: string;
    ftUsuario: string;
    email: string;
    senha: string;
    dtEntrada?: Date;
    cpf: string;
    cep: string;
    telefone: string;

    constructor() {
        this.cdUsuario = 0;//corrigir aqui e no backend
        this.nmUsuario = '';
        this.ftUsuario = '';
        this.email = '';
        this.senha = '';
        this.cpf = '';
        this.cep = '';
        this.telefone = '';
    }
}
