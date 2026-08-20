import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AvaliacaoService {
  private readonly URL = 'https://nuclleo.onrender.com/avaliacoes';

  constructor(private http: HttpClient) { }

  media(cdUsuario: number): Observable<number> {
    return this.http.get<number>(`${this.URL}/media/${cdUsuario}`);
  }
}