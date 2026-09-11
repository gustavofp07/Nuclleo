import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioModel } from '../model/usuario.model';
import { Observable } from 'rxjs';
import { UsuarioAutenticadoModel } from '../model/usuario-autenticado.model';
import { UsuarioCadastroDTOModel } from '../model/usuario-cadastro-dto.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly KEY_USUARIO = 'usuarioAutenticado';
  private readonly API_URL = 'https://nuclleo.onrender.com/api/v1/usuarios';
  private readonly AUTH_URL = 'https://nuclleo.onrender.com/api/v1/autenticar';

  autenticar(credenciais: { email: string; senha: string }): Observable<any> {
    return this.http.post<any>(this.AUTH_URL, credenciais);
  }
  constructor(private http: HttpClient) { }

  cadastrarUsuario(usuario: UsuarioCadastroDTOModel, foto?: File): Observable<UsuarioModel> {
    const formData = new FormData();

    const usuarioBlob = new Blob(
      [JSON.stringify(usuario)],
      { type: 'application/json' }
    );

    formData.append('usuario', usuarioBlob);

    if (foto) {
      formData.append('foto', foto);
    }

    return this.http.post<UsuarioModel>(
      this.API_URL,
      formData
    );
  }

  atualizar(usuario: UsuarioModel, foto?: File): Observable<UsuarioModel> {

    const formData = new FormData();
    const usuarioBlob = new Blob([JSON.stringify(usuario)], { type: 'application/json' });

    formData.append('usuario', usuarioBlob);

    if (foto) {
      formData.append('foto', foto);
    }

    return this.http.put<UsuarioModel>(this.API_URL, formData);
  }

  excluirUsuario(cdUsuario: number): Observable<UsuarioModel> {
    return this.http.delete<UsuarioModel>(`${this.API_URL}/${cdUsuario}`);
  }

  buscarUsuario(cdUsuario: number): Observable<UsuarioModel> {//varivel
    return this.http.get<UsuarioModel>(`${this.API_URL}/${cdUsuario}`);
  }

  verificarEmailExistente(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/verificar-email?email=${encodeURIComponent(email)}`);
  }

  verificarCPF(cpf: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/verificar-cpf?cpf=${encodeURIComponent(cpf)}`);
  }

  verificarCEP(cep: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/verificar-cep?cep=${encodeURIComponent(cep)}`);
  }






  //coisas da sessão
  salvarUsuarioSessao(usuario: UsuarioAutenticadoModel): void {
    localStorage.setItem(this.KEY_USUARIO, JSON.stringify(usuario));
  }

  /*
  limparSessao(): void {
    localStorage.removeItem(this.KEY_USUARIO);
  }
    */

  limparSessao(): void {
    localStorage.removeItem(this.KEY_USUARIO);

    localStorage.removeItem('buscarComunidadesProximas');
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
