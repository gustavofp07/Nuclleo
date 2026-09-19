// src/app/services/comunidade-eventos.service.ts
import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

export interface EventoComunidade {
  tipo: 'CONECTADO' | 'EXPULSO';
  cdComunidade?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ComunidadeEventosService {
  private readonly API_URL = 'https://nuclleo.onrender.com/api/v1/eventos';

  constructor(private ngZone: NgZone) { }

  // Abre a conexão SSE enquanto houver alguém inscrito; fecha ao dar unsubscribe.
  // O EventSource reconecta sozinho se a conexão cair.
  conectar(cdUsuario: number): Observable<EventoComunidade> {
    return new Observable<EventoComunidade>((subscriber) => {
      const es = new EventSource(`${this.API_URL}/comunidade/${cdUsuario}`);

      es.addEventListener('conectado', () => {
        this.ngZone.run(() => subscriber.next({ tipo: 'CONECTADO' }));
      });

      es.addEventListener('comunidade', (e: Event) => {
        try {
          const dados = JSON.parse((e as MessageEvent).data) as EventoComunidade;
          this.ngZone.run(() => subscriber.next(dados));
        } catch {
          // ignora payload inválido
        }
      });

      return () => es.close();
    });
  }
}