import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioModel } from '../model/usuario.model';
import { Observable } from 'rxjs';

import { TokenService } from './token.service';
import { TokenModel } from '../model/token.model';
import { UsuarioCadastroDTOModel } from '../model/usuario-cadastro-dto.model';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly API_URL = 'https://nuclleo.onrender.com/api/v1/usuarios';
  private readonly AUTH_URL = 'https://nuclleo.onrender.com/api/v1/autenticar';

  autenticar(credenciais: { email: string; senha: string }): Observable<any> {
    return this.http.post<any>(this.AUTH_URL, credenciais);
  }
  constructor(private http: HttpClient) { }

  //público
  cadastrarUsuario(usuario: UsuarioCadastroDTOModel, foto?: File): Observable<TokenModel> {
    const formData = new FormData();

    const usuarioBlob = new Blob(
      [JSON.stringify(usuario)],
      { type: 'application/json' }
    );

    formData.append('usuario', usuarioBlob);

    if (foto) {
      formData.append('foto', foto);
    }

    return this.http.post<TokenModel>(this.API_URL, formData);
  }

  /*
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

  verificarEmail(email: string, cdUsuario: number | null) {
    const dados = {
      email: email,
      cdUsuario: cdUsuario
    };

    return this.http.post<boolean>(`${this.API_URL}/verificar-email`, dados);
  }

  verificarCPF(cdUsuario: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/${cdUsuario}/possui-cpf`);
  }

  verificarCEP(cdUsuario: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/${cdUsuario}/possui-cep`);
  }
    */




  /*
  cadastrarUsuario(usuario: UsuarioCadastroDTOModel, foto?: File): Observable<UsuarioModel> {
    const formData = new FormData();
    const usuarioBlob = new Blob([JSON.stringify(usuario)], { type: 'application/json' });
    formData.append('usuario', usuarioBlob);
    if (foto) formData.append('foto', foto);
    return this.http.post<UsuarioModel>(this.API_URL, formData);
  }

  atualizar(usuario: UsuarioModel, foto?: File): Observable<UsuarioModel> {
    const formData = new FormData();
    const usuarioBlob = new Blob([JSON.stringify(usuario)], { type: 'application/json' });
    formData.append('usuario', usuarioBlob);
    if (foto) formData.append('foto', foto);
    return this.http.put<UsuarioModel>(this.API_URL, formData, {
      headers: this.tokenService.gerarCabecalhoAutenticacao()
    });
  }

  excluirUsuario(): Observable<UsuarioModel> {
    return this.http.delete<UsuarioModel>(this.API_URL, {
      headers: this.tokenService.gerarCabecalhoAutenticacao()
    });
  }

  buscarUsuario(cdUsuario: number): Observable<UsuarioModel> {
    return this.http.get<UsuarioModel>(`${this.API_URL}/${cdUsuario}`, {
      headers: this.tokenService.gerarCabecalhoAutenticacao()
    });
  }

  autenticar(credenciais: { email: string; senha: string }): Observable<any> {
    return this.http.post<any>(this.AUTH_URL, credenciais);
  }

  verificarEmail(email: string, cdUsuario: number | null) {
    return this.http.post<boolean>(`${this.API_URL}/verificar-email`, { email, cdUsuario });
  }

  verificarCPF(cdUsuario: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/${cdUsuario}/possui-cpf`, {
      headers: this.tokenService.gerarCabecalhoAutenticacao()
    });
  }

  verificarCEP(cdUsuario: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/${cdUsuario}/possui-cep`, {
      headers: this.tokenService.gerarCabecalhoAutenticacao()
    });
  }
    */
}