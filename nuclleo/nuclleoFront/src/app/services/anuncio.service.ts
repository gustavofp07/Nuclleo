import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { AnuncioVendaModel } from '../model/anuncio-venda.model';
import { AnuncioRequerimentoModel } from '../model/anuncio-requerimento.model';

//import { AnuncioModel } from '../model/anuncio.model';

@Injectable({
  providedIn: 'root'
})
export class AnuncioService {
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
  

  uploadImagem(arquivo: File) {

    const formData = new FormData();

    formData.append('arquivo', arquivo);

    return this.http.post<any>('http://localhost:8080/api/v1/upload', formData);
  }

}