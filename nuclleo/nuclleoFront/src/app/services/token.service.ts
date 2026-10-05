import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { TokenModel } from '../model/token.model';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly AUTORIZACAO_USUARIO = 'Authorization';

  private obterTokenArmazenado(): string {
    const valorArmazenado = localStorage.getItem(this.AUTORIZACAO_USUARIO);

    if (!valorArmazenado) {
      return '';
    }

    try {
      const valorParseado = JSON.parse(valorArmazenado);

      if (typeof valorParseado === 'string') {
        return valorParseado;
      }

      if (valorParseado && typeof valorParseado === 'object') {
        const tokenString = valorParseado.token ?? valorParseado.accessToken ?? '';
        return typeof tokenString === 'string' ? tokenString : '';
      }
    } catch {
      return valorArmazenado;
    }

    return String(valorArmazenado);
  }

  salvar(token: string | { token?: string; accessToken?: string }): void {
    const tokenString = typeof token === 'string' ? token : token?.token ?? token?.accessToken ?? '';
    localStorage.setItem(this.AUTORIZACAO_USUARIO, tokenString);
  }

  excluir(): void {
    localStorage.removeItem(this.AUTORIZACAO_USUARIO);

    localStorage.removeItem('buscarComunidadesProximas');
  }

  temToken(): boolean {
    return this.obterTokenArmazenado() !== '';
  }

  gerarCabecalhoAutenticacao(): HttpHeaders {
    return new HttpHeaders({ Authorization: 'Bearer ' + this.obterTokenArmazenado() });
  }

  extrair(): TokenModel {
    const tokenModel = new TokenModel();
    try {
      const token = this.obterTokenArmazenado();
      const partes = token.split('.');

      if (partes.length < 2 || !partes[1]) {
        return tokenModel;
      }

      const tokenBase64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
      const tokenBase64ComPadding = tokenBase64.padEnd(tokenBase64.length + ((4 - (tokenBase64.length % 4)) % 4), '=');
      const payload = JSON.parse(atob(tokenBase64ComPadding));

      tokenModel.cdUsuario = payload.cdUsuario;
      tokenModel.nmUsuario = payload.nmUsuario;
      tokenModel.ftUsuario = payload.ftUsuario;
      tokenModel.email = payload.sub;
    } catch (error) {
      console.error('Erro ao extrair token JWT', error);
    }
    return tokenModel;
  }
}