import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { TokenModel } from '../model/token.model';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly AUTORIZACAO_USUARIO = 'Authorization';

  salvar(token: string): void {
    localStorage.setItem(this.AUTORIZACAO_USUARIO, JSON.stringify(token));
  }

  excluir(): void {
    localStorage.removeItem(this.AUTORIZACAO_USUARIO);

    localStorage.removeItem('buscarComunidadesProximas');
  }

  temToken(): boolean {
    return localStorage.getItem(this.AUTORIZACAO_USUARIO) !== null;
  }

  gerarCabecalhoAutenticacao(): HttpHeaders {
    const token = JSON.parse(localStorage.getItem(this.AUTORIZACAO_USUARIO) || '""');
    return new HttpHeaders({ Authorization: 'Bearer ' + token });
  }

  extrair(): TokenModel {
    const tokenModel = new TokenModel();
    try {
      const token = JSON.parse(localStorage.getItem(this.AUTORIZACAO_USUARIO) || '""');
      const tokenBase64 = token.split('.')[1];
      const tokenJson = atob(tokenBase64);
      const payload = JSON.parse(tokenJson);
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