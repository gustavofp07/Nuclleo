import { Injectable } from '@angular/core';

import { ComunidadeModel } from '../model/comunidade.model';
import { HttpClient } from '@angular/common/http';

import { AnuncioComunidadeModel } from '../model/anuncio-comunidade.model';
import { Observable } from 'rxjs';
import { AnuncioModel } from '../model/anuncio.model';


@Injectable({
  providedIn: 'root',
})
export class AnuncioComunidadeService {
  private readonly API_URL = 'http://localhost:8080/api/v1/anuncioComunidade';

  constructor(private http: HttpClient) {
  }

  /*
  cadastrar(usuarioComunidade: UsuarioComunidadeModel): Observable<UsuarioComunidadeModel> {
    return this.http.post<UsuarioComunidadeModel>(this.API_URL, usuarioComunidade);
  }
   
  listarComunidadesPorUsuario(cdUsuario: number): Observable<UsuarioComunidadeModel[]> {
    const params = new HttpParams().set('cdUsuario', cdUsuario.toString());
    return this.http.get<UsuarioComunidadeModel[]>(`${this.API_URL}/usuario`, { params });
  }
    */

  //vou mudar isso tudo depois. Chamar um por vez, e não uma lista de relações
  cadastrarRelacoes(relacoes: {
    anuncio: AnuncioModel;
    comunidade: ComunidadeModel;
  }[]): Observable<AnuncioComunidadeModel[]> {
    return this.http.post<AnuncioComunidadeModel[]>(`${this.API_URL}/relacoes`, relacoes);
  }

  listarAnunciosDaComunidade(
    cdComunidade: number
  ): Observable<AnuncioModel[]> {

    return this.http.get<AnuncioModel[]>(
      `${this.API_URL}/comunidade/anuncios?cdComunidade=${cdComunidade}`
    );

  }

}
