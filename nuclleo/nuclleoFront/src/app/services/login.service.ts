import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginModel } from '../model/login.model';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private api = 'https://nuclleo.onrender.com/api/v1/autenticar';

  constructor(private http: HttpClient) { }

  entrar(login: LoginModel): Observable<string> {
    return this.http.post<string>(this.api, login);
  }
}