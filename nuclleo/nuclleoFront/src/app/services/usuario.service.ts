import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioModel } from '../model/usuario.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  
  private readonly API_URL = 'http://localhost:8080/api/v1/usuarios';

  constructor(private http: HttpClient) {}

  cadastrarUsuario(usuario: UsuarioModel): Observable<UsuarioModel> {//body
    return this.http.post<UsuarioModel>(this.API_URL, usuario);
  }

  buscarUsuario(cdUsuario: number): Observable<UsuarioModel> {//varivel
    return this.http.get<UsuarioModel>(`${this.API_URL}/${cdUsuario}`);
  }

  atualizar(usuario: UsuarioModel): Observable<UsuarioModel> {//body
    return this.http.put<UsuarioModel>(this.API_URL, usuario);
  }
}
