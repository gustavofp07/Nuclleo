import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComunidadeModel } from '../model/comunidade.model';
import { ComunidadeCadastroDTOModel } from '../model/comunidade-cadastro-dto.model';

@Injectable({
  providedIn: 'root'
})

export class ComunidadeService {

  private readonly API_URL = 'https://nuclleo.onrender.com/api/v1/comunidades';

  constructor(
    private http: HttpClient
  ) { }

  cadastrarComunidade(comunidade: ComunidadeCadastroDTOModel, foto?: File): Observable<ComunidadeModel> {
    const formData = new FormData();

    const comunidadeBlob = new Blob(
      [JSON.stringify(comunidade)],
      { type: 'application/json' }
    );

    formData.append('comunidade', comunidadeBlob);

    if (foto) {
      formData.append('foto', foto);
    }

    return this.http.post<ComunidadeModel>(this.API_URL, formData);
  }

  atualizarComunidade(comunidade: ComunidadeModel, foto?: File): Observable<ComunidadeModel> {
    const formData = new FormData();

    const comunidadeBlob = new Blob(
      [JSON.stringify(comunidade)],
      { type: 'application/json' }
    );

    formData.append('comunidade', comunidadeBlob);

    if (foto) {
      formData.append('foto', foto);
    }

    return this.http.put<ComunidadeModel>(`${this.API_URL}/${comunidade.cdComunidade}`, formData);
  }

  /*
  private montarFormData(comunidade: ComunidadeCadastroDTOModel, foto?: File): FormData {
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
    */

  //listar todas. Tirar depois
  listarComunidades(): Observable<ComunidadeModel[]> {
    return this.http.get<ComunidadeModel[]>(this.API_URL);
  }

  listarComunidadesProximas(cdUsuario: number): Observable<ComunidadeModel[]> {
    return this.http.get<ComunidadeModel[]>(`${this.API_URL}/proximas/${cdUsuario}`);
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