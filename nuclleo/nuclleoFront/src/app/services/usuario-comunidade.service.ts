import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { UsuarioComunidadeModel } from '../model/usuario-comunidade.model';
import { AnuncioVendaModel } from '../model/anuncio-venda.model';
import { ComunidadeModel } from '../model/comunidade.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioComunidadeService {
  private readonly API_URL = 'https://nuclleo.onrender.com/api/v1/usuarioComunidade';

  constructor(private http: HttpClient) {
  }

  cadastrar(usuarioComunidade: UsuarioComunidadeModel): Observable<UsuarioComunidadeModel> {
    return this.http.post<UsuarioComunidadeModel>(this.API_URL, usuarioComunidade);
  }

  excluir(codigo: number) {
    return this.http.delete<void>(`${this.API_URL}/${codigo}`);
  }

  listarComunidadesPorUsuario(cdUsuario: number): Observable<UsuarioComunidadeModel[]> {
    const params = new HttpParams().set('cdUsuario', cdUsuario.toString());
    return this.http.get<UsuarioComunidadeModel[]>(`${this.API_URL}/usuario`, { params });
  }

  excluirPorUsuario(cdUsuario: number) {
    return this.http.delete<number>(
      `${this.API_URL}/usuario?cdUsuario=${cdUsuario}`
    );
  }

  excluirRelacaoEspecifica(cdUsuario: number, cdComunidade: number): Observable<void> {
    const params = new HttpParams()
      .set('cdUsuario', cdUsuario.toString())
      .set('cdComunidade', cdComunidade.toString());
    return this.http.delete<void>(`${this.API_URL}/relacao`, { params });
  }

  listarUsuariosPorComunidade(cdComunidade: number): Observable<UsuarioComunidadeModel[]> {
    const params = new HttpParams().set('cdComunidade', cdComunidade.toString());
    return this.http.get<UsuarioComunidadeModel[]>(`${this.API_URL}/comunidade`, { params });
  }

}
