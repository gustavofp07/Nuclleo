import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ComunidadeModel } from '../model/comunidade.model';

@Injectable({
  providedIn: 'root'
})

export class ComunidadeService {

  private readonly API_URL = 'http://localhost:8080/api/v1/comunidades';
  //private api = 'http://localhost:8080/api/v1/comunidades';

  constructor(
    private http: HttpClient
  ) { }

  cadastrarComunidade(comunidade: ComunidadeModel): Observable<ComunidadeModel> {
    return this.http.post<ComunidadeModel>(this.API_URL,comunidade);
  }

  listarComunidades():Observable<ComunidadeModel[]> {
      return this.http.get<ComunidadeModel[]>(this.API_URL);
  }

}