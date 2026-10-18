import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComunidadeModel } from '../model/comunidade.model';
import { ComunidadeCadastroDTOModel } from '../model/comunidade-cadastro-dto.model';
import { TokenService } from './token.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComunidadeService {
  private readonly API_URL = `${environment.apiUrl}/api/v1/comunidades`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) { }

  private getHeaders() {
    return { headers: this.tokenService.gerarCabecalhoAutenticacao() };
  }

  private montarFormData(comunidade: ComunidadeCadastroDTOModel | ComunidadeModel, foto?: File): FormData {
    const formData = new FormData();

    formData.append('comunidade', new Blob([JSON.stringify(comunidade)], { type: 'application/json' }));

    if (foto) {
      formData.append('foto', foto);
    }

    return formData;
  }

  cadastrarComunidade(comunidade: ComunidadeCadastroDTOModel, foto?: File): Observable<ComunidadeModel> {
    return this.http.post<ComunidadeModel>(this.API_URL, this.montarFormData(comunidade, foto), this.getHeaders());
  }

  atualizarComunidade(comunidade: ComunidadeModel, foto?: File): Observable<ComunidadeModel> {
    return this.http.put<ComunidadeModel>(
      `${this.API_URL}/${comunidade.cdComunidade}`,
      this.montarFormData(comunidade, foto),
      this.getHeaders()
    );
  }

  listarComunidades(termo?: string): Observable<ComunidadeModel[]> {
    let url: string;
    if (termo && termo.trim()) {
      url = `${this.API_URL}?termo=${encodeURIComponent(termo.trim())}`;
    } else {
      url = this.API_URL;
    }

    return this.http.get<ComunidadeModel[]>(url, this.getHeaders());
  }

  listarComunidadesProximas(cdUsuario: number, termo?: string): Observable<ComunidadeModel[]> {
    let url: string;
    if (termo && termo.trim()) {
      url = `${this.API_URL}/proximas/${cdUsuario}?termo=${encodeURIComponent(termo.trim())}`;
    } else {
      url = `${this.API_URL}/proximas/${cdUsuario}`;
    }

    return this.http.get<ComunidadeModel[]>(url, this.getHeaders());
  }

  buscarComunidade(cdComunidade: number): Observable<ComunidadeModel> {
    return this.http.get<ComunidadeModel>(`${this.API_URL}/${cdComunidade}`, this.getHeaders());
  }

  listarComunidadesDoUsuario(cdUsuario: number): Observable<ComunidadeModel[]> {
    return this.http.get<ComunidadeModel[]>(`${this.API_URL}/usuario/${cdUsuario}`, this.getHeaders());
  }

  excluir(cdComunidade: number): Observable<ComunidadeModel> {
    return this.http.delete<ComunidadeModel>(`${this.API_URL}/${cdComunidade}`, this.getHeaders());
  }

  // O back confere pelo token se quem expulsa é o dono, remove o vínculo e avisa o membro
  expulsarMembro(cdComunidade: number, cdUsuario: number): Observable<void> {
    return this.http.post<void>(
      `${this.API_URL}/${cdComunidade}/usuarios/${cdUsuario}/expulsar`,
      null,
      this.getHeaders()
    );
  }
}
