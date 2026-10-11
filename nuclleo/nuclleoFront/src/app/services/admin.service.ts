import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { TokenService } from './token.service';
import { environment } from 'src/environments/environment';
import { DenunciaModel, PaginaModel, SancaoModel, StatusDenuncia, TipoAlvo } from '../model/denuncia.model';
import { AnuncioModel } from '../model/anuncio.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_ADMIN = `${environment.apiUrl}/api/v1/admin`;
  private readonly API_USUARIOS = `${environment.apiUrl}/api/v1/usuarios`;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) { }

  private getHeaders() {
    return { headers: this.tokenService.gerarCabecalhoAutenticacao() };
  }

  // ===================== DENÚNCIAS =====================

  listarDenuncias(status: StatusDenuncia | null, tipoAlvo: TipoAlvo | null, page = 0, size = 20)
    : Observable<PaginaModel<DenunciaModel>> {
    let params = new HttpParams().set('page', page).set('size', size);

    if (status) params = params.set('status', status);
    if (tipoAlvo) params = params.set('tipoAlvo', tipoAlvo);

    return this.http.get<PaginaModel<DenunciaModel>>(
      `${this.API_ADMIN}/denuncias`,
      { ...this.getHeaders(), params }
    );
  }

  buscarDenuncia(cdDenuncia: number): Observable<DenunciaModel> {
    return this.http.get<DenunciaModel>(`${this.API_ADMIN}/denuncias/${cdDenuncia}`, this.getHeaders());
  }

  listarDenunciasDoUsuario(cdUsuario: number): Observable<DenunciaModel[]> {
    return this.http.get<DenunciaModel[]>(`${this.API_ADMIN}/usuarios/${cdUsuario}/denuncias`, this.getHeaders());
  }

  analisarDenuncia(cdDenuncia: number, status: 'PROCEDENTE' | 'IMPROCEDENTE'): Observable<DenunciaModel> {
    return this.http.put<DenunciaModel>(
      `${this.API_ADMIN}/denuncias/${cdDenuncia}/analisar`,
      { status },
      this.getHeaders()
    );
  }

  excluirDenuncia(cdDenuncia: number): Observable<void> {
    return this.http.delete<void>(`${this.API_ADMIN}/denuncias/${cdDenuncia}`, this.getHeaders());
  }

  // Histórico do admin logado (perfil do admin)
  listarDenunciasDescartadasPorMim(): Observable<DenunciaModel[]> {
    return this.http.get<DenunciaModel[]>(`${this.API_ADMIN}/denuncias/descartadas-por-mim`, this.getHeaders());
  }

  listarSancoesAplicadasPorMim(): Observable<SancaoModel[]> {
    return this.http.get<SancaoModel[]>(`${this.API_ADMIN}/sancoes/minhas`, this.getHeaders());
  }

  // ===================== CONTAS =====================

  // O GET comum de usuário também é liberado para o ADMINISTRADOR
  buscarUsuario(cdUsuario: number): Observable<any> {
    return this.http.get<any>(`${this.API_USUARIOS}/${cdUsuario}`, this.getHeaders());
  }

  // dias = null => suspensão permanente (só volta se um admin reativar)
  suspenderUsuario(cdUsuario: number, dias: number | null, cdDenuncia: number | null): Observable<SancaoModel> {
    return this.http.put<SancaoModel>(
      `${this.API_ADMIN}/usuarios/${cdUsuario}/suspender`,
      { dias, permanente: dias === null, cdDenuncia },
      this.getHeaders()
    );
  }

  reativarUsuario(cdUsuario: number): Observable<SancaoModel> {
    return this.http.put<SancaoModel>(`${this.API_ADMIN}/usuarios/${cdUsuario}/reativar`, {}, this.getHeaders());
  }

  listarSancoes(cdUsuario: number): Observable<SancaoModel[]> {
    return this.http.get<SancaoModel[]>(`${this.API_ADMIN}/usuarios/${cdUsuario}/sancoes`, this.getHeaders());
  }

  // ===================== ANÚNCIOS =====================

  // Todos os anúncios do usuário, inclusive os suspensos
  listarAnunciosDoUsuario(cdUsuario: number): Observable<(AnuncioModel & { status: string })[]> {
    return this.http.get<(AnuncioModel & { status: string })[]>(
      `${this.API_ADMIN}/usuarios/${cdUsuario}/anuncios`,
      this.getHeaders()
    );
  }

  buscarAnuncio(cdAnuncio: number): Observable<AnuncioModel & { status: string }> {
    return this.http.get<AnuncioModel & { status: string }>(
      `${this.API_ADMIN}/anuncios/${cdAnuncio}`,
      this.getHeaders()
    );
  }

  excluirAnuncio(cdAnuncio: number, cdDenuncia: number | null): Observable<SancaoModel> {
    return this.http.put<SancaoModel>(
      `${this.API_ADMIN}/anuncios/${cdAnuncio}/excluir`,
      { cdDenuncia },
      this.getHeaders()
    );
  }
}
