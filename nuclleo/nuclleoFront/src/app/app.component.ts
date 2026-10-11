import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import {
  IonApp, IonRouterOutlet, IonContent, IonLabel, IonItem,
  IonList, IonIcon, IonMenu, IonAccordion,
  IonAccordionGroup, ToastController, AlertController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  add, calendarOutline, checkmarkCircleOutline, chatbubbleOutline, createOutline,
  eyeOffOutline, eyeOutline, heartOutline, home, homeOutline, imageOutline,
  locationOutline, logOutOutline, mailOutline, personOutline, peopleOutline,
  settingsOutline, trashOutline, chevronBackOutline, megaphoneOutline,
  pricetagOutline, cartOutline, flagOutline, warningOutline
} from 'ionicons/icons';

import { InteresseService } from 'src/app/services/interesse.service';
import { NotificacaoService } from 'src/app/services/notificacao.service';
import { AdminService } from 'src/app/services/admin.service';
import { TokenService } from './services/token.service';
import { TemaService } from './services/tema.service';
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
  totalDenunciasPendentes: number = 0;
  ehAdmin: boolean = false;

  constructor(
    private router: Router,
    private interesseService: InteresseService,
    private notificacaoService: NotificacaoService,
    private toastController: ToastController,
    private alertController: AlertController,
    private adminService: AdminService,
    private tokenService: TokenService,
    private temaService: TemaService
  ) {
    this.temaService.iniciar();
    this.token = new TokenModel();

    addIcons({
      add, calendarOutline, checkmarkCircleOutline, chatbubbleOutline, createOutline,
      eyeOffOutline, eyeOutline, heartOutline, home, homeOutline, imageOutline,
      locationOutline, logOutOutline, mailOutline, personOutline, peopleOutline,
      settingsOutline, trashOutline, chevronBackOutline, megaphoneOutline,
      pricetagOutline, cartOutline, flagOutline, warningOutline
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const rotaAtual = this.router.url.split('?')[0];

        this.menuHabilitado = !this.ROTAS_SEM_MENU.includes(rotaAtual);

        if (this.tokenService.temToken()) {
          this.token = this.tokenService.extrair();
          this.ehAdmin = this.tokenService.isAdmin();

          this.carregarNotificacoes();
          this.conectarNotificacoesTempoReal();
        } else {
          this.token = new TokenModel();
          this.ehAdmin = false;
          this.totalConversasPendentes = 0;
          this.totalDenunciasPendentes = 0;

          this.notificacaoService.desconectar();
        }
      });
  }

  ngOnInit() {
    this.notificacaoService.onNotificacaoRecebida().subscribe(evento => {
      switch (evento.tipo) {
        case 'SOLICITACAO_CONVERSA':
          this.totalConversasPendentes++;
          this.mostrarToast(evento.mensagem);
          break;

        // Admin: chegou uma denúncia nova
        case 'NOVA_DENUNCIA':
          this.totalDenunciasPendentes++;
          this.mostrarToast(evento.mensagem, 'flag-outline');
          break;

        // Moderação: a conta foi suspensa e o token deixou de valer
        case 'CONTA_SUSPENSA':
          this.encerrarSessaoSuspensa(evento.mensagem);
          break;

        // Moderação: anúncio do usuário suspenso/removido, ou conversa encerrada por causa disso
        case 'ANUNCIO_SUSPENSO':
        case 'ANUNCIO_EXCLUIDO':
        case 'INTERESSE_ENCERRADO':
          this.mostrarToast(evento.mensagem, 'warning-outline', 'warning', 5000);
          break;
      }
    });
  }

  conectarNotificacoesTempoReal() {
    if (!this.tokenService.temToken()) {
      this.notificacaoService.desconectar();
      return;
    }

    this.notificacaoService.conectar(this.token.cdUsuario, this.ehAdmin);
  }

  async encerrarSessaoSuspensa(mensagem: string) {
    this.tokenService.excluir();
    this.notificacaoService.desconectar();

    const alert = await this.alertController.create({
      header: 'Conta suspensa',
      message: mensagem + ' Você será desconectado.',
      backdropDismiss: false,
      buttons: [{ text: 'OK', handler: () => { this.router.navigate(['/login']); } }]
    });
    await alert.present();
  }

  async mostrarToast(mensagem: string, icone: string = 'chatbubble-outline', cor: string = 'primary', duracao: number = 3000) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: duracao,
      position: 'top',
      color: cor,
      icon: icone
    });
    await toast.present();
  }

  carregarNotificacoes() {
    if (!this.tokenService.temToken()) {
      this.totalConversasPendentes = 0;
      return;
    }

    // O admin não usa conversas: o contador dele é o de denúncias pendentes
    if (this.ehAdmin) {
      this.adminService.listarDenuncias('PENDENTE', null, 0, 1).subscribe({
        next: (pagina) => this.totalDenunciasPendentes = pagina.totalElements,
        error: () => { }
      });
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
