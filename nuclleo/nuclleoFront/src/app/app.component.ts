import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  Router,
  RouterLink,
  NavigationEnd
} from '@angular/router';

import { filter } from 'rxjs/operators';

import {
  IonApp,
  IonRouterOutlet,
  IonToolbar,
  IonContent,
  IonLabel,
  IonItem,
  IonList,
  IonHeader,
  IonTitle,
  IonIcon,
  IonMenu,
  IonAccordion,
  IonAccordionGroup,
  IonBadge
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  add,
  calendarOutline,
  checkmarkCircleOutline,
  chatbubbleOutline,
  createOutline,
  eyeOffOutline,
  eyeOutline,
  heartOutline,
  home,
  homeOutline,
  imageOutline,
  locationOutline,
  logOutOutline,
  mailOutline,
  personOutline,
  peopleOutline,
  settingsOutline,
  trashOutline,
  chevronBackOutline,
  megaphoneOutline,
  pricetagOutline,
  cartOutline
} from 'ionicons/icons';

import { InteresseService } from 'src/app/services/interesse.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  styleUrls: ['app.component.scss'],

  imports: [
    CommonModule,
    RouterLink,
    IonApp,
    IonRouterOutlet,
    IonToolbar,
    IonContent,
    IonLabel,
    IonItem,
    IonList,
    IonHeader,
    IonTitle,
    IonIcon,
    IonMenu,
    IonAccordion,
    IonAccordionGroup,
    IonBadge
  ],
})

export class AppComponent {

  menuHabilitado = true;
  totalInteressesRecebidos: number = 0;

  constructor(
    private router: Router,
    private interesseService: InteresseService,
    private usuarioService: UsuarioService,
  ) {

    addIcons({
      add,
      calendarOutline,
      checkmarkCircleOutline,
      chatbubbleOutline,
      createOutline,
      eyeOffOutline,
      eyeOutline,
      heartOutline,
      home,
      homeOutline,
      imageOutline,
      locationOutline,
      logOutOutline,
      mailOutline,
      personOutline,
      peopleOutline,
      settingsOutline,
      trashOutline,
      chevronBackOutline,
      megaphoneOutline,
      pricetagOutline,
      cartOutline
    });

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {

        const rotaAtual = this.router.url;

        this.menuHabilitado =
          rotaAtual !== '/login' &&
          rotaAtual !== '/cadastro';

        this.carregarNotificacoes();
      });

  }

  carregarNotificacoes() {

    const possuiSessao = this.usuarioService.verificarSessao();

    if (!possuiSessao) {
      this.totalInteressesRecebidos = 0;
      return;
    }

    const usuario = this.usuarioService.getUsuarioSessao();

    this.interesseService.listarPorInteressados(usuario.cdUsuario).subscribe({
      next: (interesses) => {
        this.totalInteressesRecebidos = interesses.filter(i => !(i as any).aceito).length;
      },
      error: () => {
        // silencioso: não queremos toast no menu por causa disso
      }
    });
  }

}