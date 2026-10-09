import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonToggle
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { moonOutline, sunnyOutline, phonePortraitOutline } from 'ionicons/icons';

import { PreferenciaTema, TemaService } from 'src/app/services/tema.service';

interface OpcaoTema {
  valor: PreferenciaTema;
  nome: string;
  icone: string;
}

@Component({
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.page.html',
  styleUrls: ['./configuracoes.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonIcon,
    IonToggle
  ]
})
export class ConfiguracoesPage {
  readonly temas: OpcaoTema[] = [
    { valor: 'escuro', nome: 'Escuro', icone: 'moon-outline' },
    { valor: 'claro', nome: 'Claro', icone: 'sunny-outline' },
    { valor: 'sistema', nome: 'Sistema', icone: 'phone-portrait-outline' }
  ];

  constructor(private temaService: TemaService) {
    addIcons({ moonOutline, sunnyOutline, phonePortraitOutline });
  }

  get preferencia(): PreferenciaTema {
    return this.temaService.preferenciaAtual;
  }

  get modoClaro(): boolean {
    return this.temaService.modoClaroAtivo;
  }

  alternarModoClaro(ativo: boolean) {
    this.temaService.definir(ativo ? 'claro' : 'escuro');
  }

  escolherTema(tema: PreferenciaTema) {
    this.temaService.definir(tema);
  }
}
