import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InteresseService {
  private readonly URL = 'https://nuclleo.onrender.com/api/v1/interesses';

  constructor(private http: HttpClient) { }

  
  //tá retornando any. Mudar isso depois e criar um model de interesse
  registrarInteresse(interesse: { cdUsuario: number; cdAnuncio: number; }): Observable<any> {
    console.log('Registrando interesse: ', interesse);
    return this.http.post<any>(`${this.URL}`, interesse);
  }
  
}
