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

  // Paginado: os mais novos primeiro
  listarAnunciosDaComunidade(
    cdComunidade: number,
    page = 0,
    size = 20
  ): Observable<PaginaModel<AnuncioModel>> {
    return this.http.get<any>(
      `${this.API_URL}/comunidade/anuncios`,
      { ...this.getHeaders(), params: { cdComunidade, page, size } }
    ).pipe(paraPagina<AnuncioModel>());
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
