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

    if (!valorArmazenado) return '';

    try {
      const valorParseado = JSON.parse(valorArmazenado);

      if (typeof valorParseado === 'string') return valorParseado;

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
    const tokenString = typeof token === 'string'
      ? token
      : token?.token ?? token?.accessToken ?? '';
    localStorage.setItem(this.AUTORIZACAO_USUARIO, tokenString);
  }

  excluir(): void {
    localStorage.removeItem(this.AUTORIZACAO_USUARIO);
    localStorage.removeItem('buscarComunidadesProximas');
  }

  temToken(): boolean {
    return this.obterTokenArmazenado() !== '';
  }

  // Tem token e ele ainda não expirou (o "exp" do JWT é em segundos)
  estaAutenticado(): boolean {
    if (!this.temToken()) return false;

    try {
      const exp = this.lerPayload()?.exp;
      return typeof exp !== 'number' || exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  gerarCabecalhoAutenticacao(): HttpHeaders {
    return new HttpHeaders({ Authorization: 'Bearer ' + this.obterTokenArmazenado() });
  }

  extrair(): TokenModel {
    const tokenModel = new TokenModel();
    try {
      const payload = this.lerPayload();
      if (!payload) return tokenModel;

      tokenModel.cdUsuario = payload.cdUsuario;
      tokenModel.nmUsuario = payload.nmUsuario;
      tokenModel.ftUsuario = payload.ftUsuario;
      tokenModel.email = payload.sub;
      tokenModel.perfil = payload.perfil;
    } catch (error) {
      console.error('Erro ao extrair token JWT', error);
    }
    return tokenModel;
  }

  private lerPayload(): any {
    const partes = this.obterTokenArmazenado().split('.');

    if (partes.length < 2 || !partes[1]) return null;

    const tokenBase64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    const tokenBase64ComPadding = tokenBase64.padEnd(
      tokenBase64.length + ((4 - (tokenBase64.length % 4)) % 4), '='
    );
    return JSON.parse(atob(tokenBase64ComPadding));
  }

  isAdmin(): boolean {
    return this.extrair().perfil === 'ADMINISTRADOR';
  }

  isUsuario(): boolean {
    return this.extrair().perfil === 'USUARIO';
  }
}
