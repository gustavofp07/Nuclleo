import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InteresseModel } from '../model/interesse.model';
import { TokenService } from './token.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InteresseService {
  private readonly URL = `${environment.apiUrl}/api/v1/interesses`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) { }

  private getHeaders() {
    return { headers: this.tokenService.gerarCabecalhoAutenticacao() };
  }

  registrarInteresse(interesse: { cdUsuario: number; cdAnuncio: number; }): Observable<InteresseModel> {
    return this.http.post<InteresseModel>(`${this.URL}`, interesse, this.getHeaders());
  }

  listarPorUsuario(cdUsuario: number): Observable<InteresseModel[]> {
    return this.http.get<InteresseModel[]>(`${this.URL}/usuario/${cdUsuario}`, this.getHeaders());
  }

  listarPorInteressados(cdUsuario: number): Observable<InteresseModel[]> {
    return this.http.get<InteresseModel[]>(`${this.URL}/interessados/${cdUsuario}`, this.getHeaders());
  }

  buscarPorId(id: number): Observable<InteresseModel> {
    return this.http.get<InteresseModel>(`${this.URL}/${id}`, this.getHeaders());
  }

  excluirInteresse(codigo: number): Observable<void> {
    return this.http.delete<void>(`${this.URL}/excluir/${codigo}`, this.getHeaders());
  }

  finalizarConversa(id: number, dados: { cdUsuarioSolicitante: number; ocorreuTransacao: boolean; valor?: number; notaInteressado: number; }): Observable<void> {
    return this.http.put<void>(`${this.URL}/${id}/finalizar`, dados, this.getHeaders());
  }

  aceitarInteresse(cdInteresse: number, cdUsuarioSolicitante: number): Observable<void> {
    return this.http.put<void>(`${this.URL}/${cdInteresse}/aceitar`, { cdUsuarioSolicitante }, this.getHeaders());
  }

  iniciarConversa(cdInteresse: number, cdUsuarioSolicitante: number): Observable<void> {
    return this.http.put<void>(`${this.URL}/${cdInteresse}/iniciar-conversa`, { cdUsuarioSolicitante }, this.getHeaders());
  }

  recusarConversa(cdInteresse: number, cdUsuarioSolicitante: number): Observable<void> {
    return this.http.put<void>(`${this.URL}/${cdInteresse}/recusar-conversa`, { cdUsuarioSolicitante }, this.getHeaders());
  }

  avaliarAnunciante(id: number, dados: { cdUsuarioSolicitante: number; nota: number; }): Observable<void> {
    return this.http.put<void>(`${this.URL}/${id}/avaliar-anunciante`, dados, this.getHeaders());
  }
}
