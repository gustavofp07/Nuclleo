import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AnuncioVendaModel } from '../model/anuncio-venda.model';
import { AnuncioRequerimentoModel } from '../model/anuncio-requerimento.model';
import { AnuncioModel } from '../model/anuncio.model';
import { TokenService } from './token.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnuncioService {
  private readonly API_URL = `${environment.apiUrl}/api/v1/anuncios`;
  private readonly API_URL_VENDA = `${environment.apiUrl}/api/v1/anuncios/vendas`;
  private readonly API_URL_REQUERIMENTO = `${environment.apiUrl}/api/v1/anuncios/requerimentos`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) { }

  private getHeaders() {
    return { headers: this.tokenService.gerarCabecalhoAutenticacao() };
  }

  cadastrarVenda(anuncio: AnuncioVendaModel, foto?: File): Observable<AnuncioVendaModel> {
    return this.http.post<AnuncioVendaModel>(
      this.API_URL_VENDA,
      this.montarFormData(anuncio, foto),
      this.getHeaders()
    );
  }

  cadastrarRequerimento(anuncio: AnuncioRequerimentoModel, foto?: File): Observable<AnuncioRequerimentoModel> {
    return this.http.post<AnuncioRequerimentoModel>(
      this.API_URL_REQUERIMENTO,
      this.montarFormData(anuncio, foto),
      this.getHeaders()
    );
  }

  listarAnunciosPorUsuario(cdUsuario: number): Observable<AnuncioModel[]> {
    return this.http.get<AnuncioModel[]>(
      `${this.API_URL}/usuario/${cdUsuario}`,
      this.getHeaders()
    );
  }

  listarAnunciosPorUsuarioTipo(cdUsuario: number, tipo: 'venda' | 'compra'): Observable<AnuncioModel[]> {
    const tipoBack = tipo === 'venda' ? 'VENDA' : 'REQUERIMENTO';

    return this.listarAnunciosPorUsuario(cdUsuario).pipe(
      map(anuncios => anuncios.filter(anuncio => anuncio.tipoAnuncio === tipoBack))
    );
  }

  listarTodos(): Observable<AnuncioModel[]> {
    return this.http.get<AnuncioModel[]>(this.API_URL, this.getHeaders());
  }

  buscarAnuncio(cdAnuncio: number): Observable<AnuncioModel> {
    return this.http.get<AnuncioModel>(
      `${this.API_URL}/${cdAnuncio}`,
      this.getHeaders()
    );
  }

  excluirAnuncio(cdAnuncio: number): Observable<AnuncioModel> {
    return this.http.delete<AnuncioModel>(
      `${this.API_URL}/${cdAnuncio}`,
      this.getHeaders()
    );
  }

  alterarVenda(anuncio: AnuncioVendaModel, foto?: File): Observable<AnuncioVendaModel> {
    return this.http.put<AnuncioVendaModel>(
      this.API_URL_VENDA,
      this.montarFormData(anuncio, foto),
      this.getHeaders()
    );
  }

  alterarRequerimento(anuncio: AnuncioRequerimentoModel, foto?: File): Observable<AnuncioRequerimentoModel> {
    return this.http.put<AnuncioRequerimentoModel>(
      this.API_URL_REQUERIMENTO,
      this.montarFormData(anuncio, foto),
      this.getHeaders()
    );
  }

  private montarFormData(anuncio: AnuncioModel, foto?: File): FormData {
    const formData = new FormData();

    const anuncioBlob = new Blob(
      [JSON.stringify(anuncio)],
      { type: 'application/json' }
    );

    formData.append('anuncio', anuncioBlob);

    if (foto) {
      formData.append('foto', foto);
    }

    return formData;
  }

  uploadImagem(arquivo: File) {
    const formData = new FormData();

    formData.append('arquivo', arquivo);

    return this.http.post<any>(`${environment.apiUrl}/api/v1/upload`, formData, this.getHeaders());
  }
}
