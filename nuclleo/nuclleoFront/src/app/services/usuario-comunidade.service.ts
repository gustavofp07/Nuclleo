import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { UsuarioComunidadeModel } from '../model/usuario-comunidade.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioComunidadeService {
  private readonly API_URL = 'http://localhost:8080/api/v1/usuarioComunidade';

  constructor(private http: HttpClient) {
  }

  cadastrar(usuarioComunidade: UsuarioComunidadeModel): Observable<UsuarioComunidadeModel> {
    return this.http.post<UsuarioComunidadeModel>(this.API_URL, usuarioComunidade);
  }

  listarComunidadesPorUsuario(cdUsuario: number): Observable<UsuarioComunidadeModel[]> {
    return this.http.get<UsuarioComunidadeModel[]>(`${this.API_URL}/usuario/${cdUsuario}`);
  }

  listarUsuariosPorComunidade(cdComunidade: number): Observable<UsuarioComunidadeModel[]> {
    return this.http.get<UsuarioComunidadeModel[]>(`${this.API_URL}/comunidade/${cdComunidade}`);
  }
}
