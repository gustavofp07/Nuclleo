import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ComunidadeModel } from '../model/comunidade.model';

@Injectable({
  providedIn: 'root'
})

export class ComunidadeService {

  private api =
    'http://localhost:8080/api/v1/comunidades';

  constructor(
    private http: HttpClient
  ) { }

  cadastrarComunidade(
    comunidade: ComunidadeModel
  ): Observable<ComunidadeModel> {

    return this.http.post<ComunidadeModel>(
      this.api,
      comunidade
    );

  }

  listarComunidades():
    Observable<ComunidadeModel[]> {

    return this.http.get<ComunidadeModel[]>(
      this.api
    );

  }

}