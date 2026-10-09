export class UsuarioModel {
    cdUsuario: number;
    nmUsuario: string;
    ftUsuario: string;
    email: string;
    senha: string;
    dtEntrada: Date;
    cpf: string;
    cep: string;
    cidade: string;
    uf: string;
    telefone: string;

    constructor() {
        this.cdUsuario = 0;
        this.nmUsuario = '';
        this.ftUsuario = '';
        this.email = '';
        this.senha = '';
        this.dtEntrada = new Date();
        this.cpf = '';
        this.cep = '';
        this.cidade = '';
        this.uf = '';
        this.telefone = '';
    }
}
