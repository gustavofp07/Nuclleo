export type TipoAlvo = 'ANUNCIO' | 'USUARIO';
export type StatusDenuncia = 'PENDENTE' | 'PROCEDENTE' | 'IMPROCEDENTE';

export class DenunciaModel {
    cdDenuncia: number;
    cdDenunciante: number;
    nomeDenunciante: string;
    tipoAlvo: TipoAlvo;
    cdAnuncio: number | null;
    nmAnuncio: string | null;
    cdUsuarioDenunciado: number;
    nmUsuarioDenunciado: string;
    motivo: string;
    descricao: string | null;
    snapshotAnuncio: string | null;
    status: StatusDenuncia;
    dtCriacao: string;
    cdAdminResponsavel: number | null;
    nmAdminResponsavel: string | null;
    dtAnalise: string | null;

    constructor() {
        this.cdDenuncia = 0;
        this.cdDenunciante = 0;
        this.nomeDenunciante = '';
        this.tipoAlvo = 'ANUNCIO';
        this.cdAnuncio = null;
        this.nmAnuncio = null;
        this.cdUsuarioDenunciado = 0;
        this.nmUsuarioDenunciado = '';
        this.motivo = '';
        this.descricao = null;
        this.snapshotAnuncio = null;
        this.status = 'PENDENTE';
        this.dtCriacao = '';
        this.cdAdminResponsavel = null;
        this.nmAdminResponsavel = null;
        this.dtAnalise = null;
    }
}

export interface SancaoModel {
    cdSancao: number;
    tipoAlvo: TipoAlvo;
    cdUsuario: number;
    nmUsuario: string;
    cdAnuncio: number | null;
    nmAnuncio: string | null;
    tipo: 'SUSPENSAO' | 'REATIVACAO' | 'EXCLUSAO';
    dias: number | null;
    dtInicio: string;
    dtFim: string | null;
    cdAdmin: number | null;
    nmAdmin: string | null;
    cdDenuncia: number | null;
}

export type { PaginaModel } from './pagina.model';

// Mesma lista do enum MotivoDenuncia do back-end
export const MOTIVOS_DENUNCIA: { valor: string; rotulo: string }[] = [
    { valor: 'GOLPE_FRAUDE', rotulo: 'Golpe ou fraude' },
    { valor: 'PRODUTO_PROIBIDO', rotulo: 'Produto proibido' },
    { valor: 'INFORMACAO_FALSA', rotulo: 'Informação falsa ou enganosa' },
    { valor: 'CONTEUDO_OFENSIVO', rotulo: 'Conteúdo ofensivo' },
    { valor: 'ASSEDIO', rotulo: 'Assédio' },
    { valor: 'SPAM_DUPLICADO', rotulo: 'Spam ou anúncio duplicado' },
    { valor: 'PERFIL_FALSO', rotulo: 'Perfil falso' },
    { valor: 'OUTRO', rotulo: 'Outro' }
];

// "conta" é feminino e "anúncio" é masculino: o rótulo concorda com o alvo
export function rotuloStatusAlvo(status: string | undefined, tipoAlvo: TipoAlvo): string {
    const a = tipoAlvo === 'USUARIO' ? 'a' : 'o';

    switch (status) {
        case 'ATIVO': return `Ativ${a}`;
        case 'SUSPENSO': return `Suspens${a}`;
        case 'EXCLUIDO': return `Excluíd${a}`;
        default: return '—';
    }
}

export function rotuloSancao(sancao: SancaoModel): string {
    const ehConta = sancao.tipoAlvo === 'USUARIO';
    const alvo = ehConta ? `Conta de ${sancao.nmUsuario}` : `Anúncio "${sancao.nmAnuncio}"`;
    const a = ehConta ? 'a' : 'o';

    switch (sancao.tipo) {
        case 'SUSPENSAO':
            return sancao.dias
                ? `${alvo} suspens${a} por ${sancao.dias} ${sancao.dias === 1 ? 'dia' : 'dias'}`
                : `${alvo} suspens${a} permanentemente`;
        case 'REATIVACAO':
            return `${alvo} reativad${a}`;
        default:
            return `${alvo} excluíd${a}`;
    }
}

export function rotuloMotivo(valor: string): string {
    return MOTIVOS_DENUNCIA.find(m => m.valor === valor)?.rotulo ?? valor;
}
