import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import {
  IonApp, IonRouterOutlet, IonContent, IonLabel, IonItem,
  IonList, IonIcon, IonMenu, IonAccordion,
  IonAccordionGroup, ToastController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  add, calendarOutline, checkmarkCircleOutline, chatbubbleOutline, createOutline,
  eyeOffOutline, eyeOutline, heartOutline, home, homeOutline, imageOutline,
  locationOutline, logOutOutline, mailOutline, personOutline, peopleOutline,
  settingsOutline, trashOutline, chevronBackOutline, megaphoneOutline,
  pricetagOutline, cartOutline
} from 'ionicons/icons';

import { InteresseService } from 'src/app/services/interesse.service';
import { NotificacaoService } from 'src/app/services/notificacao.service';
import { TokenService } from './services/token.service';
import { TokenModel } from './model/token.model';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  styleUrls: ['app.component.scss'],
  imports: [
    CommonModule, RouterLink, RouterLinkActive, IonApp, IonRouterOutlet, IonContent,
    IonLabel, IonItem, IonList, IonIcon, IonMenu,
    IonAccordion, IonAccordionGroup
  ],
})
export class AppComponent implements OnInit {
  private readonly ROTAS_SEM_MENU = ['/login', '/usuario-cadastro'];

  token: TokenModel;

  menuHabilitado = true;
  totalConversasPendentes: number = 0;

  constructor(
    private router: Router,
    private interesseService: InteresseService,
    private notificacaoService: NotificacaoService,
    private toastController: ToastController,
    private tokenService: TokenService
  ) {
    this.token = new TokenModel();

    addIcons({
      add, calendarOutline, checkmarkCircleOutline, chatbubbleOutline, createOutline,
      eyeOffOutline, eyeOutline, heartOutline, home, homeOutline, imageOutline,
      locationOutline, logOutOutline, mailOutline, personOutline, peopleOutline,
      settingsOutline, trashOutline, chevronBackOutline, megaphoneOutline,
      pricetagOutline, cartOutline
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const rotaAtual = this.router.url.split('?')[0];

        this.menuHabilitado = !this.ROTAS_SEM_MENU.includes(rotaAtual);

        if (this.tokenService.temToken()) {
          this.token = this.tokenService.extrair();

          this.carregarNotificacoes();
          this.conectarNotificacoesTempoReal();
        } else {
          this.token = new TokenModel();
          this.totalConversasPendentes = 0;

          this.notificacaoService.desconectar();
        }
      });
  }

  ngOnInit() {
    this.notificacaoService.onNotificacaoRecebida().subscribe(evento => {
      if (evento.tipo === 'SOLICITACAO_CONVERSA') {
        this.totalConversasPendentes++;
        this.mostrarToast(evento.mensagem);
      }
    });
  }

  conectarNotificacoesTempoReal() {
    if (!this.tokenService.temToken()) {
      this.notificacaoService.desconectar();
      return;
    }

    this.notificacaoService.conectar(this.token.cdUsuario);
  }

  async mostrarToast(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 3000,
      position: 'top',
      color: 'primary',
      icon: 'chatbubble-outline'
    });
    await toast.present();
  }

  carregarNotificacoes() {
    if (!this.tokenService.temToken()) {
      this.totalConversasPendentes = 0;
      return;
    }

    this.interesseService.listarPorInteressados(this.token.cdUsuario).subscribe({
      next: (interesses) => {
        this.totalConversasPendentes = interesses.filter(
          i => i.conversaIniciada === true && i.aceito === false
        ).length;
      },
      error: () => { }
    });
  }
}
