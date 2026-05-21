import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioModel } from '../model/usuario.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly KEY_USUARIO = 'usuarioAutenticado';
  private readonly API_URL = 'http://localhost:8080/api/v1/usuarios';

  constructor(private http: HttpClient) { }

  cadastrarUsuario(usuario: UsuarioModel): Observable<UsuarioModel> {//body
    return this.http.post<UsuarioModel>(this.API_URL, usuario);
  }

  excluirUsuario(cdUsuario: number): Observable<UsuarioModel> {
    return this.http.delete<UsuarioModel>(`${this.API_URL}/${cdUsuario}`);
  }

  buscarUsuario(cdUsuario: number): Observable<UsuarioModel> {//varivel
    return this.http.get<UsuarioModel>(`${this.API_URL}/${cdUsuario}`);
  }

  atualizar(usuario: UsuarioModel): Observable<UsuarioModel> {//body
    return this.http.put<UsuarioModel>(this.API_URL, usuario);
  }


  //coisas da sessão
  salvarUsuarioSessao(usuario: UsuarioModel): void {
    localStorage.setItem(this.KEY_USUARIO, JSON.stringify(usuario));
  }

  limparSessao(): void {
    localStorage.removeItem(this.KEY_USUARIO);
  }

  verificarSessao(): boolean {
    if (localStorage.getItem(this.KEY_USUARIO) !== null) {
      return true;
    } else {
      return false;
    }
  }

  getUsuarioSessao(): UsuarioModel {
    const usuarioJson = localStorage.getItem(this.KEY_USUARIO);
    if (usuarioJson) {
      return JSON.parse(usuarioJson) as UsuarioModel;
    }
    return new UsuarioModel();
  }
}
