import { OperatorFunction, map } from 'rxjs';

// Página como o front usa
export interface PaginaModel<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    last: boolean;
}

// Formato que o back devolve (Spring Data com PageSerializationMode.VIA_DTO)
interface PaginaResposta<T> {
    content: T[];
    page: { size: number; number: number; totalElements: number; totalPages: number };
}

// Converte a resposta paginada do back no PaginaModel
export function paraPagina<T>(): OperatorFunction<PaginaResposta<T>, PaginaModel<T>> {
    return map(resposta => ({
        content: resposta.content,
        totalElements: resposta.page.totalElements,
        totalPages: resposta.page.totalPages,
        number: resposta.page.number,
        last: resposta.page.number + 1 >= resposta.page.totalPages
    }));
}
