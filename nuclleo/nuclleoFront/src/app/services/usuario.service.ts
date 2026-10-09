import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioModel } from '../model/usuario.model';
import { Observable } from 'rxjs';

import { TokenService } from './token.service';
import { TokenModel } from '../model/token.model';
import { UsuarioCadastroDTOModel } from '../model/usuario-cadastro-dto.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private readonly API_URL = `${environment.apiUrl}/api/v1/usuarios`;
  private readonly AUTH_URL = `${environment.apiUrl}/api/v1/autenticar`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) { }

  private getHeaders() {
    return { headers: this.tokenService.gerarCabecalhoAutenticacao() };
  }

  autenticar(credenciais: { email: string; senha: string }): Observable<any> {
    return this.http.post<any>(this.AUTH_URL, credenciais);
  }

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

  verificarEmail(email: string, cdUsuario: number | null) {
    const dados = {
      email: email,
      cdUsuario: cdUsuario
    };

    return this.http.post<boolean>(`${this.API_URL}/verificar-email`, dados);
  }

  atualizar(usuario: UsuarioModel, foto?: File): Observable<UsuarioModel> {
    const formData = new FormData();
    const usuarioBlob = new Blob([JSON.stringify(usuario)], { type: 'application/json' });

    formData.append('usuario', usuarioBlob);

    if (foto) {
      formData.append('foto', foto);
    }

    return this.http.put<UsuarioModel>(this.API_URL, formData, this.getHeaders());
  }

  alterarSenha(senhaAtual: string, novaSenha: string): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/senha`, { senhaAtual, novaSenha }, this.getHeaders());
  }

  buscarUsuario(cdUsuario: number): Observable<UsuarioModel> {
    return this.http.get<UsuarioModel>(`${this.API_URL}/${cdUsuario}`, this.getHeaders());
  }

  excluirUsuario(): Observable<UsuarioModel> {
    return this.http.delete<UsuarioModel>(this.API_URL, this.getHeaders());
  }

  verificarCEP(cdUsuario: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/${cdUsuario}/possui-cep`, this.getHeaders());
  }
}
