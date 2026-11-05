import { Injectable } from '@angular/core';

import { ComunidadeModel } from '../model/comunidade.model';
import { HttpClient } from '@angular/common/http';

import { AnuncioComunidadeModel } from '../model/anuncio-comunidade.model';
import { Observable } from 'rxjs';
import { AnuncioModel } from '../model/anuncio.model';
import { TokenService } from './token.service';
import { environment } from 'src/environments/environment';

import { PaginaModel, paraPagina } from '../model/pagina.model';

@Injectable({
  providedIn: 'root',
})
export class AnuncioComunidadeService {
  private readonly API_URL = `${environment.apiUrl}/api/v1/anuncioComunidade`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
  }

  private getHeaders() {
    return { headers: this.tokenService.gerarCabecalhoAutenticacao() };
  }

  cadastrarRelacoes(relacoes: {
    anuncio: AnuncioModel;
    comunidade: ComunidadeModel;
  }[]): Observable<AnuncioComunidadeModel[]> {
    return this.http.post<AnuncioComunidadeModel[]>(`${this.API_URL}/relacoes`, relacoes, this.getHeaders());
  }

  // Paginado: os mais novos primeiro. Sem filtros, traz todos os anúncios da comunidade
  listarAnunciosDaComunidade(
    cdComunidade: number,
    page = 0,
    size = 20,
    filtros: { busca?: string; tipo?: string } = {}
  ): Observable<PaginaModel<AnuncioModel>> {
    const params: Record<string, string | number> = { cdComunidade, page, size };

    if (filtros.busca) {
      params['busca'] = filtros.busca;
    }

    if (filtros.tipo) {
      params['tipo'] = filtros.tipo;
    }

    return this.http.get<any>(
      `${this.API_URL}/comunidade/anuncios`,
      { ...this.getHeaders(), params }
    ).pipe(paraPagina<AnuncioModel>());
  }

  // Os anúncios com mais pessoas interessadas, do mais procurado para o menos
  listarPopularesDaComunidade(cdComunidade: number, limite = 5): Observable<AnuncioModel[]> {
    return this.http.get<AnuncioModel[]>(
      `${this.API_URL}/comunidade/anuncios/populares`,
      { ...this.getHeaders(), params: { cdComunidade, limite } }
    );
  }

  excluirRelacoesPorAnuncio(cdAnuncio: number) {
    return this.http.delete<AnuncioComunidadeModel[]>(
      `${this.API_URL}/anuncio?cdAnuncio=${cdAnuncio}`,
      this.getHeaders()
    );
  }

  listarRelacoesPorAnuncio(cdAnuncio: number) {
    return this.http.get<AnuncioComunidadeModel[]>(
      `${this.API_URL}/anuncio?cdAnuncio=${cdAnuncio}`,
      this.getHeaders()
    );
  }
}
