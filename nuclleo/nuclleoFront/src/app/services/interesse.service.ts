import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InteresseModel } from '../model/interesse.model';

@Injectable({
  providedIn: 'root',
})
export class InteresseService {
  private readonly URL = 'https://nuclleo.onrender.com/api/v1/interesses';

  constructor(private http: HttpClient) { }

  registrarInteresse(interesse: { cdUsuario: number; cdAnuncio: number; }): Observable<InteresseModel> {
    console.log('Registrando interesse: ', interesse);
    return this.http.post<InteresseModel>(`${this.URL}`, interesse);
  }

  listarPorUsuario(cdUsuario: number): Observable<InteresseModel[]> {
    return this.http.get<InteresseModel[]>(`${this.URL}/usuario/${cdUsuario}`);
  }

  listarPorInteressados(cdUsuario: number): Observable<InteresseModel[]> {
    return this.http.get<InteresseModel[]>(`${this.URL}/interessados/${cdUsuario}`);
  }

  buscarPorId(id: number): Observable<InteresseModel> {
    return this.http.get<InteresseModel>(`${this.URL}/${id}`);
  }

  excluirInteresse(codigo: number): Observable<void> {
    return this.http.delete<void>(`${this.URL}/excluir/${codigo}`);
  }

  finalizarConversa(id: number, dados: { cdUsuarioSolicitante: number; ocorreuTransacao: boolean; valor?: number; notaInteressado: number; }): Observable<void> {
    return this.http.put<void>(`${this.URL}/${id}/finalizar`, dados);
  }

  aceitarInteresse(cdInteresse: number, cdUsuarioSolicitante: number): Observable<void> {
    return this.http.put<void>(`${this.URL}/${cdInteresse}/aceitar`, { cdUsuarioSolicitante });
  }

  iniciarConversa(cdInteresse: number, cdUsuarioSolicitante: number): Observable<void> { // <-- ADICIONADO
    return this.http.put<void>(`${this.URL}/${cdInteresse}/iniciar-conversa`, { cdUsuarioSolicitante });
  }

  recusarConversa(cdInteresse: number, cdUsuarioSolicitante: number): Observable<void> { // <-- ADICIONADO
    return this.http.put<void>(`${this.URL}/${cdInteresse}/recusar-conversa`, { cdUsuarioSolicitante });
  }

  avaliarAnunciante(id: number, dados: { cdUsuarioSolicitante: number; nota: number; }): Observable<void> {
    return this.http.put<void>(`${this.URL}/${id}/avaliar-anunciante`, dados);
  }
}