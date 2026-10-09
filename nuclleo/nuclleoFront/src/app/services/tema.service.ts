import { Injectable } from '@angular/core';

export type PreferenciaTema = 'escuro' | 'claro' | 'sistema';

@Injectable({
  providedIn: 'root'
})
export class TemaService {
  private readonly CHAVE = 'nuclleoTema';
  private readonly CLASSE_CLARO = 'tema-claro';
  private readonly midiaSistema = window.matchMedia('(prefers-color-scheme: light)');

  private preferencia: PreferenciaTema = 'escuro';

  constructor() {
    this.midiaSistema.addEventListener('change', () => {
      if (this.preferencia === 'sistema') {
        this.aplicar();
      }
    });
  }

  iniciar() {
    const salva = localStorage.getItem(this.CHAVE);
    this.preferencia = salva === 'claro' || salva === 'sistema' ? salva : 'escuro';
    this.aplicar();
  }

  get preferenciaAtual(): PreferenciaTema {
    return this.preferencia;
  }

  get modoClaroAtivo(): boolean {
    return this.preferencia === 'claro' || (this.preferencia === 'sistema' && this.midiaSistema.matches);
  }

  definir(preferencia: PreferenciaTema) {
    this.preferencia = preferencia;
    localStorage.setItem(this.CHAVE, preferencia);
    this.aplicar();
  }

  private aplicar() {
    const claro = this.modoClaroAtivo;

    document.documentElement.classList.toggle(this.CLASSE_CLARO, claro);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', claro ? '#f6f4fb' : '#0a0910');
    document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', claro ? 'light' : 'dark');
  }
}
