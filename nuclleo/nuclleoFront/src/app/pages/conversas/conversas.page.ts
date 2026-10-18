import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonButtons,
  IonIcon,
  IonButton,
  IonSpinner,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { chatbubblesOutline, checkmarkDoneOutline, closeOutline, chevronForwardOutline, flagOutline,
  pricetagOutline, star } from 'ionicons/icons';

import { InteresseService } from 'src/app/services/interesse.service';
import { InteresseModel } from 'src/app/model/interesse.model';
import { TokenService } from 'src/app/services/token.service';
import { TokenModel } from 'src/app/model/token.model';
import { NotificacaoService } from 'src/app/services/notificacao.service';
import { FinalizarConversaComponent } from 'src/app/components/finalizar-conversa/finalizar-conversa.component';

interface ConversaView {
  cdInteresse: number;
  cdOutroUsuario: number;
  nomeOutroUsuario: string;
  fotoOutroUsuario: string | null;
  cdAnuncio: number;
  nmAnuncio: string;
  finalizado: boolean;
  souAnunciante: boolean;
  aceito: boolean;
}

@Component({
  selector: 'app-conversas',
  templateUrl: './conversas.page.html',
  styleUrls: ['./conversas.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonMenuButton,
    IonButtons,
    IonIcon,
    IonButton,
    IonSpinner,
    FinalizarConversaComponent
  ]
})
export class ConversasPage {
  token: TokenModel;

  conversas: ConversaView[] = [];
  carregando: boolean = false;

  // Conversa aberta na tela de estrelas: o anunciante finaliza, o interessado avalia
  conversaFinalizando: ConversaView | null = null;
  modoTela: 'finalizar' | 'avaliar' = 'finalizar';

  private notificacaoSub?: Subscription;

  get solicitacoes(): ConversaView[] {
    return this.conversas.filter(c => !c.aceito && !c.finalizado);
  }

  get conversasAtivas(): ConversaView[] {
    return this.conversas.filter(c => c.aceito || c.finalizado);
  }

  constructor(
    private interesseService: InteresseService,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router,
    private tokenService: TokenService,
    private notificacaoService: NotificacaoService
  ) {
    this.token = new TokenModel();
    addIcons({ chatbubblesOutline, checkmarkDoneOutline, closeOutline, chevronForwardOutline, flagOutline, pricetagOutline, star });
  }

  ionViewWillEnter() {
    if (!this.tokenService.temToken()) {
      this.exibirMensagem('Não há usuário logado.');
      this.router.navigate(['/login']);
      return;
    }

    this.token = this.tokenService.extrair();
    this.carregarConversas();

    // O anunciante finalizou uma conversa com a tela aberta: atualiza a lista
    this.notificacaoSub?.unsubscribe();
    this.notificacaoSub = this.notificacaoService.onNotificacaoRecebida().subscribe(evento => {
      if (evento.tipo === 'CONVERSA_FINALIZADA') {
        this.carregarConversas();
      }
    });
  }

  ionViewWillLeave() {
    this.notificacaoSub?.unsubscribe();
  }

  carregarConversas() {
    this.carregando = true;

    forkJoin({
      comoInteressado: this.interesseService.listarPorUsuario(this.token.cdUsuario),
      comoAnunciante: this.interesseService.listarPorInteressados(this.token.cdUsuario)
    }).subscribe({
      next: ({ comoInteressado, comoAnunciante }) => {
        const mapa = new Map<number, InteresseModel>();

        [...comoInteressado, ...comoAnunciante]
          .filter(i => i.conversaIniciada === true)
          .forEach(i => mapa.set(i.id, i));

        this.conversas = Array.from(mapa.values()).map(interesse => this.mapearConversa(interesse));
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.exibirMensagem('Erro ao carregar conversas.');
      }
    });
  }

  mapearConversa(interesse: InteresseModel): ConversaView {
    const souEuOInteressado = interesse.usuario.cdUsuario === this.token.cdUsuario;

    return {
      cdInteresse: interesse.id,
      cdOutroUsuario: souEuOInteressado
        ? interesse.anuncio.usuarioCria.cdUsuario
        : interesse.usuario.cdUsuario,
      nomeOutroUsuario: souEuOInteressado
        ? interesse.anuncio.usuarioCria.nmUsuario
        : interesse.usuario.nmUsuario,
      fotoOutroUsuario: souEuOInteressado
        ? interesse.anuncio.usuarioCria.ftUsuario
        : interesse.usuario.ftUsuario,
      cdAnuncio: interesse.anuncio.cdAnuncio,
      nmAnuncio: interesse.anuncio.nmAnuncio,
      finalizado: interesse.finalizado,
      souAnunciante: !souEuOInteressado,
      aceito: interesse.aceito
    };
  }

  // Solicitação recebida também abre o chat: o anunciante lê as mensagens e decide lá
  abrirChat(conversa: ConversaView) {
    this.interesseService.buscarPorId(conversa.cdInteresse).subscribe({
      next: () => {
        this.router.navigate(['/chat', conversa.cdInteresse]);
      },
      error: () => {
        this.conversas = this.conversas.filter(c => c.cdInteresse !== conversa.cdInteresse);
        this.exibirMensagem('Essa conversa já foi encerrada.');
      }
    });
  }

  aceitarConversa(conversa: ConversaView, event: Event) {
    event.stopPropagation();

    this.interesseService.aceitarInteresse(conversa.cdInteresse, this.token.cdUsuario).subscribe({
      next: () => {
        conversa.aceito = true;
        this.router.navigate(['/chat', conversa.cdInteresse]);
      },
      error: () => this.exibirMensagem('Erro ao aceitar a conversa.')
    });
  }

  async confirmarRecusa(conversa: ConversaView, event: Event) {
    event.stopPropagation();

    const alert = await this.alertController.create({
      header: 'Recusar conversa',
      message: `Deseja realmente recusar a conversa com ${conversa.nomeOutroUsuario}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Recusar',
          role: 'destructive',
          handler: () => this.recusarConversa(conversa)
        }
      ]
    });

    await alert.present();
  }

  recusarConversa(conversa: ConversaView) {
    this.interesseService.recusarConversa(conversa.cdInteresse, this.token.cdUsuario).subscribe({
      next: () => {
        this.conversas = this.conversas.filter(c => c.cdInteresse !== conversa.cdInteresse);
        this.exibirMensagem('Conversa recusada.');
      },
      error: () => this.exibirMensagem('Erro ao recusar a conversa.')
    });
  }

  // Foto ou nome do outro usuário: abre o perfil dele (sem abrir o chat)
  abrirPerfil(conversa: ConversaView, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/usuario-perfil', conversa.cdOutroUsuario]);
  }

  // Abre o anúncio da conversa sem abrir o chat (o card inteiro abre o chat)
  abrirAnuncio(conversa: ConversaView, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/anuncio-tela', conversa.cdAnuncio]);
  }

  podeFinalizar(conversa: ConversaView): boolean {
    return conversa.souAnunciante && conversa.aceito && !conversa.finalizado;
  }

  // Interessado: o anunciante já finalizou e falta a avaliação dele
  podeAvaliar(conversa: ConversaView): boolean {
    return !conversa.souAnunciante && conversa.finalizado;
  }

  abrirFinalizar(conversa: ConversaView, event: Event) {
    event.stopPropagation();
    this.modoTela = 'finalizar';
    this.conversaFinalizando = conversa;
  }

  abrirAvaliar(conversa: ConversaView, event: Event) {
    event.stopPropagation();
    this.modoTela = 'avaliar';
    this.conversaFinalizando = conversa;
  }

  aoConcluirTela() {
    const conversa = this.conversaFinalizando;

    if (conversa && this.modoTela === 'finalizar') {
      conversa.finalizado = true;
    } else if (conversa) {
      // Os dois avaliaram: a conversa é concluída e sai da lista
      this.conversas = this.conversas.filter(c => c.cdInteresse !== conversa.cdInteresse);
    }

    this.conversaFinalizando = null;
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({ message: texto, duration: 2000, position: 'top' });
    await toast.present();
  }
}