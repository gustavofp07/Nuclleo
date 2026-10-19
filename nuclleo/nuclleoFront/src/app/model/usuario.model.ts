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
    // Preenchidos pelo back-end (somente leitura)
    perfil?: string;
    status?: string;
    suspensoAte?: string | null;
    // CPF, CEP e e-mail só vêm preenchidos no próprio perfil (ou para o admin);
    // para os outros usuários o back manda só se eles existem
    possuiCpf?: boolean;
    possuiCep?: boolean;

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
    }
}
