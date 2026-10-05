import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import {
  IonApp, IonRouterOutlet, IonToolbar, IonContent, IonLabel, IonItem,
  IonList, IonHeader, IonTitle, IonIcon, IonMenu, IonAccordion,
  IonAccordionGroup, IonBadge, ToastController
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
import { UsuarioService } from 'src/app/services/usuario.service';
import { NotificacaoService } from 'src/app/services/notificacao.service';
import { TokenService } from './services/token.service';
import { TokenModel } from './model/token.model';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  styleUrls: ['app.component.scss'],
  imports: [
    CommonModule, RouterLink, IonApp, IonRouterOutlet, IonToolbar, IonContent,
    IonLabel, IonItem, IonList, IonHeader, IonTitle, IonIcon, IonMenu,
    IonAccordion, IonAccordionGroup, IonBadge
  ],
})
export class AppComponent implements OnInit {
  token: TokenModel;

  menuHabilitado = true;
  totalConversasPendentes: number = 0;

  constructor(
    private router: Router,
    private interesseService: InteresseService,
    //private usuarioService: UsuarioService,
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
        console.log('Aqui de novo no appComponent');
        const rotaAtual = this.router.url;

        this.menuHabilitado = rotaAtual !== '/login' && rotaAtual !== '/cadastro';

        if (this.tokenService.temToken()) {
          console.log('Tem token');

          // Atualiza os dados com o JWT atual
          this.token = this.tokenService.extrair();

          this.carregarNotificacoes();
          this.conectarNotificacoesTempoReal();

        } else {
          console.log('Não tem token');
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
    const possuiSessao = this.tokenService.temToken();

    if (!possuiSessao) {
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
    const possuiSessao = this.tokenService.temToken();

    if (!possuiSessao) {
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