import { Injectable } from '@angular/core';

import { LoginModel } from '../model/login.model';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioAutenticadoModel } from '../model/usuario-autenticado.model';



@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private api = 'https://nuclleo.onrender.com/api/v1/autenticar';

  constructor(private http: HttpClient) { }

  entrar(login: LoginModel): Observable<UsuarioAutenticadoModel> {
    return this.http.post<UsuarioAutenticadoModel>(this.api, login);
  }
}
