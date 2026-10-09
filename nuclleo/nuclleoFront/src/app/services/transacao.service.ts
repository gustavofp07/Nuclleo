import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TransacaoModel } from '../model/transacao.model';
import { TokenService } from './token.service';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class TransacaoService {
  private readonly URL = `${environment.apiUrl}/transacoes`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) { }

  private getHeaders() {
    return { headers: this.tokenService.gerarCabecalhoAutenticacao() };
  }

  listarPorUsuario(cdUsuario: number): Observable<TransacaoModel[]> {
    return this.http.get<TransacaoModel[]>(`${this.URL}/usuario/${cdUsuario}`, this.getHeaders());
  }
}
