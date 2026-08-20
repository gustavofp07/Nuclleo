import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TransacaoModel } from '../model/transacao.model';

@Injectable({ providedIn: 'root' })
export class TransacaoService {
  private readonly URL = 'https://nuclleo.onrender.com/transacoes';

  constructor(private http: HttpClient) { }

  listarPorUsuario(cdUsuario: number): Observable<TransacaoModel[]> {
    return this.http.get<TransacaoModel[]>(`${this.URL}/usuario/${cdUsuario}`);
  }
}