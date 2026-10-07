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

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) { }

  //público
  // CORREÇÃO: o campo `senha` estava sem nome ({ email: string;  : string }), o que não compila.
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

  //privados
  atualizar(usuario: UsuarioModel, foto?: File): Observable<UsuarioModel> {

    const formData = new FormData();
    const usuarioBlob = new Blob([JSON.stringify(usuario)], { type: 'application/json' });

    formData.append('usuario', usuarioBlob);

    if (foto) {
      formData.append('foto', foto);
    }

    return this.http.put<UsuarioModel>(this.API_URL, formData, {
      headers: this.tokenService.gerarCabecalhoAutenticacao()
    });
  }

  // NOVO: troca a senha do usuário logado.
  // Segue o mesmo padrão de atualizar/excluirUsuario: o backend identifica
  // o usuário pelo token, então não precisa mandar o cdUsuario.
  // Backend: PUT /api/v1/usuarios/senha  com body { senhaAtual, novaSenha }
  alterarSenha(senhaAtual: string, novaSenha: string): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/senha`, { senhaAtual, novaSenha }, {
      headers: this.tokenService.gerarCabecalhoAutenticacao()
    });
  }

  buscarUsuario(cdUsuario: number): Observable<UsuarioModel> {
    return this.http.get<UsuarioModel>(`${this.API_URL}/${cdUsuario}`, {
      headers: this.tokenService.gerarCabecalhoAutenticacao()
    });
  }

  excluirUsuario(): Observable<UsuarioModel> {
    return this.http.delete<UsuarioModel>(this.API_URL, {
      headers: this.tokenService.gerarCabecalhoAutenticacao()
    });
  }

  verificarCEP(cdUsuario: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.API_URL}/${cdUsuario}/possui-cep`, {
      headers: this.tokenService.gerarCabecalhoAutenticacao()
    });
  }

  /*
    verificarCPF(cdUsuario: number): Observable<boolean> {
      return this.http.get<boolean>(`${this.API_URL}/${cdUsuario}/possui-cpf`, {
        headers: this.tokenService.gerarCabecalhoAutenticacao()
      });
    }
  */
}