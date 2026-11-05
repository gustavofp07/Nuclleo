import { UsuarioModel } from "./usuario.model";

export class AnuncioModel {
    cdAnuncio: number;
    nmAnuncio: string;
    descricao: string;
    ftAnuncio: string;
    tipoAnuncio: string;
    // Preenchidos pelo back-end (somente leitura). O dono também vê os seus anúncios suspensos
    status?: 'ATIVO' | 'SUSPENSO' | 'INATIVO' | 'EXCLUIDO';
    suspensoAte?: string | null;
    // Vem só nas listagens de anúncios da comunidade
    totalInteressados?: number;

    usuarioCria: UsuarioModel;

    dtCriacao?: Date;

    cdUsuarioCria: number;

    constructor() {
        this.cdAnuncio = 0;
        this.nmAnuncio = '';
        this.descricao = '';
        this.ftAnuncio = '';
        this.tipoAnuncio = '';
        this.cdUsuarioCria = 0;
        this.usuarioCria = new UsuarioModel();
    }
}
