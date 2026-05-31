import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AnuncioService {

  private apiVenda =
    'http://localhost:8080/api/v1/anuncios/vendas';

  private apiRequerimento =
    'http://localhost:8080/api/v1/anuncios/requerimentos';

  constructor(
    private http: HttpClient
  ) {}

  cadastrarVenda(anuncio: any) {
    return this.http.post(
      this.apiVenda,
      anuncio
    );
  }

  cadastrarRequerimento(anuncio: any) {
    return this.http.post(
      this.apiRequerimento,
      anuncio
    );
  }

  uploadImagem(arquivo: File) {

  const formData = new FormData();

  formData.append(
    'arquivo',
    arquivo
  );

  return this.http.post<any>(
    'http://localhost:8080/api/v1/upload',
    formData
  );

}

}