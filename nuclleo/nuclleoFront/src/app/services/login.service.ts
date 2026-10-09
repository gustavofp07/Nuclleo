import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginModel } from '../model/login.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private api = `${environment.apiUrl}/api/v1/autenticar`;

  constructor(private http: HttpClient) { }

  entrar(login: LoginModel): Observable<string> {
    return this.http.post<string>(this.api, login);
  }
}
