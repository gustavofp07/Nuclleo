import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { AnuncioVendaModel } from '../model/anuncio-venda.model';
import { AnuncioRequerimentoModel } from '../model/anuncio-requerimento.model';
import { AnuncioModel } from '../model/anuncio.model';

@Injectable({
  providedIn: 'root'
})
export class AnuncioService {
  private readonly API_URL = 'http://localhost:8080/api/v1/anuncios';
  private readonly API_URL_VENDA = 'http://localhost:8080/api/v1/anuncios/vendas';
  private readonly API_URL_REQUERIMENTO = 'http://localhost:8080/api/v1/anuncios/requerimentos';

  constructor(
    private http: HttpClient
  ) { }


  cadastrarVenda(anuncio: AnuncioVendaModel): Observable<AnuncioVendaModel> {
    return this.http.post<AnuncioVendaModel>(this.API_URL_VENDA, anuncio);
  }

  cadastrarRequerimento(anuncio: AnuncioRequerimentoModel): Observable<AnuncioRequerimentoModel> {
    return this.http.post<AnuncioRequerimentoModel>(this.API_URL_REQUERIMENTO, anuncio);
  }

  listarAnunciosPorUsuario(cdUsuario: number): Observable<AnuncioModel[]> {
    return this.http.get<AnuncioModel[]>(
      `${this.API_URL}/usuario/${cdUsuario}`
    );
  }

  listarTodos(): Observable<AnuncioModel[]> {
    return this.http.get<AnuncioModel[]>(this.API_URL);
  }

  buscarAnuncio(cdAnuncio: number): Observable<AnuncioModel> {
    return this.http.get<AnuncioModel>(
      `${this.API_URL}/${cdAnuncio}`
    );
  }

  excluirAnuncio(cdAnuncio: number): Observable<AnuncioModel> {
  return this.http.delete<AnuncioModel>(
    `${this.API_URL}/${cdAnuncio}`
  );
}

alterarVenda(anuncio: AnuncioVendaModel): Observable<AnuncioVendaModel> {
  return this.http.put<AnuncioVendaModel>(
    this.API_URL_VENDA,
    anuncio
  );
}

alterarRequerimento(anuncio: AnuncioRequerimentoModel): Observable<AnuncioRequerimentoModel> {
  return this.http.put<AnuncioRequerimentoModel>(
    this.API_URL_REQUERIMENTO,
    anuncio
  );
}

  uploadImagem(arquivo: File) {

    const formData = new FormData();

    formData.append('arquivo', arquivo);

    return this.http.post<any>('http://localhost:8080/api/v1/upload', formData);
  }

}