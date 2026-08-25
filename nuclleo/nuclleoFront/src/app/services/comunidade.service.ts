import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComunidadeModel } from '../model/comunidade.model';

@Injectable({
  providedIn: 'root'
})

export class ComunidadeService {

  private readonly API_URL = 'https://nuclleo.onrender.com/api/v1/comunidades';
  //private api = 'http://localhost:8080/api/v1/comunidades';

  constructor(
    private http: HttpClient
  ) { }

  cadastrarComunidade(comunidade: ComunidadeModel, foto?: File): Observable<ComunidadeModel> {
    return this.http.post<ComunidadeModel>(this.API_URL, this.montarFormData(comunidade, foto));
  }

  atualizarComunidade(comunidade: ComunidadeModel, foto?: File): Observable<ComunidadeModel> {
    return this.http.put<ComunidadeModel>(`${this.API_URL}/${comunidade.cdComunidade}`, this.montarFormData(comunidade, foto));
  }

  private montarFormData(comunidade: ComunidadeModel, foto?: File): FormData {
    const formData = new FormData();

    const comunidadeBlob = new Blob(
      [JSON.stringify(comunidade)],
      { type: 'application/json' }
    );

    formData.append('comunidade', comunidadeBlob);

    if (foto) {
      formData.append('foto', foto);
    }

    return formData;
  }

  //listar todas. Tirar depois
  listarComunidades(): Observable<ComunidadeModel[]> {
    return this.http.get<ComunidadeModel[]>(this.API_URL);
  }

  listarComunidadesDoUsuario(cdUsuario: number): Observable<ComunidadeModel[]> {
    return this.http.get<ComunidadeModel[]>(`${this.API_URL}/usuario/${cdUsuario}`);
  }

  excluir(cdComunidade: number): Observable<ComunidadeModel> {
    return this.http.delete<ComunidadeModel>(`${this.API_URL}/${cdComunidade}`);
  }

  buscarComunidade(cdComunidade: number): Observable<ComunidadeModel> {
    return this.http.get<ComunidadeModel>(`${this.API_URL}/${cdComunidade}`);
  }
}