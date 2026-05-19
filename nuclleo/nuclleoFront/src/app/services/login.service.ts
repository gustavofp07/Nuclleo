import { Injectable } from '@angular/core';

import { LoginModel } from '../model/login.model';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { UsuarioModel } from '../model/usuario.model';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private api = 'http://localhost:8080/api/v1/autenticar';

  constructor(private http: HttpClient) { }

  entrar(login: LoginModel): Observable<UsuarioModel> {
    return this.http.post<UsuarioModel>(this.api, login);
  }
}
