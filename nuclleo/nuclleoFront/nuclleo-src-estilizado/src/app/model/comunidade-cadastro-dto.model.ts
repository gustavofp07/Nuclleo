export class ComunidadeCadastroDTOModel {
        descricao: string;
        nmComunidade: string;
        cdUsuarioCria: number;
        cep: string;

        constructor() {
            this.descricao = '';
            this.nmComunidade = '';
            this.cdUsuarioCria = 0;
            this.cep = '';
        }
}
