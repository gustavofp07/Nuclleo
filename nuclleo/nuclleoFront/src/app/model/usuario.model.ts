export class UsuarioModel {
    cdUsuario?: number;   // opcional (vem do backend)
    nmUsuario: string;
    ftUsuario?: string;
    email: string;
    senha: string;
    dtEntrada?: Date;
    cpf: string;
    cep: string;
    telefone: string;

    constructor() {
        this.nmUsuario = '';
        this.email = '';
        this.senha = '';
        this.cpf = '';
        this.cep = '';
        this.telefone = '';
    }
}
