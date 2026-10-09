import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface EventoComunidade {
  tipo: 'CONECTADO' | 'EXPULSO';
  cdComunidade?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ComunidadeEventosService {
  private readonly API_URL = `${environment.apiUrl}/api/v1/eventos`;

  constructor(private ngZone: NgZone) { }

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
        }
      });

      return () => es.close();
    });
  }
}
