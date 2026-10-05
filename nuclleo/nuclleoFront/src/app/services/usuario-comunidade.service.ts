import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { UsuarioComunidadeModel } from '../model/usuario-comunidade.model';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class UsuarioComunidadeService {
  private readonly API_URL = 'https://nuclleo.onrender.com/api/v1/usuarioComunidade';

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
  }

  private getHeaders() {
    return { headers: this.tokenService.gerarCabecalhoAutenticacao() };
  }

  cadastrar(usuarioComunidade: UsuarioComunidadeModel): Observable<UsuarioComunidadeModel> {
    return this.http.post<UsuarioComunidadeModel>(this.API_URL, usuarioComunidade, this.getHeaders());
  }

  excluir(codigo: number) {
    return this.http.delete<void>(`${this.API_URL}/${codigo}`, this.getHeaders());
  }

  listarComunidadesPorUsuario(cdUsuario: number): Observable<UsuarioComunidadeModel[]> {
    const params = new HttpParams().set('cdUsuario', cdUsuario.toString());
    return this.http.get<UsuarioComunidadeModel[]>(`${this.API_URL}/usuario`, { params, ...this.getHeaders() });
  }

  excluirPorUsuario(cdUsuario: number) {
    return this.http.delete<number>(
      `${this.API_URL}/usuario?cdUsuario=${cdUsuario}`,
      this.getHeaders()
    );
  }

  excluirRelacaoEspecifica(cdUsuario: number, cdComunidade: number): Observable<void> {
    const params = new HttpParams()
      .set('cdUsuario', cdUsuario.toString())
      .set('cdComunidade', cdComunidade.toString());
    return this.http.delete<void>(`${this.API_URL}/relacao`, { params, ...this.getHeaders() });
  }

  listarUsuariosPorComunidade(cdComunidade: number): Observable<UsuarioComunidadeModel[]> {
    const params = new HttpParams().set('cdComunidade', cdComunidade.toString());
    return this.http.get<UsuarioComunidadeModel[]>(`${this.API_URL}/comunidade`, { params, ...this.getHeaders() });
  }

}
