import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class AvaliacaoService {
  private readonly URL = 'https://nuclleo.onrender.com/avaliacoes';

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) { }

  private getHeaders() {
    return { headers: this.tokenService.gerarCabecalhoAutenticacao() };
  }

  media(cdUsuario: number): Observable<number> {
    return this.http.get<number>(`${this.URL}/media/${cdUsuario}`, this.getHeaders());
  }
}