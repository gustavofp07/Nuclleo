import { Injectable } from '@angular/core';

import { ComunidadeModel } from '../model/comunidade.model';
import { HttpClient } from '@angular/common/http';

import { AnuncioComunidadeModel } from '../model/anuncio-comunidade.model';
import { Observable } from 'rxjs';
import { AnuncioModel } from '../model/anuncio.model';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AnuncioComunidadeService {
  private readonly API_URL = 'https://nuclleo.onrender.com/api/v1/anuncioComunidade';

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
  }

  private getHeaders() {
    return { headers: this.tokenService.gerarCabecalhoAutenticacao() };
  }

  //vou mudar isso tudo depois. Chamar um por vez, e não uma lista de relações
  cadastrarRelacoes(relacoes: {
    anuncio: AnuncioModel;
    comunidade: ComunidadeModel;
  }[]): Observable<AnuncioComunidadeModel[]> {
    return this.http.post<AnuncioComunidadeModel[]>(`${this.API_URL}/relacoes`, relacoes, this.getHeaders());
  }

  listarAnunciosDaComunidade(
    cdComunidade: number
  ): Observable<AnuncioModel[]> {

    return this.http.get<AnuncioModel[]>(
      `${this.API_URL}/comunidade/anuncios?cdComunidade=${cdComunidade}`,
      this.getHeaders()
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
