import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonButtons,
  IonIcon,
  IonButton,
  IonSpinner
} from '@ionic/angular/standalone';

import { AlertController, ToastController } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { chatbubblesOutline, checkmarkDoneOutline, closeOutline } from 'ionicons/icons';

import { InteresseService } from 'src/app/services/interesse.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { InteresseModel } from 'src/app/model/interesse.model';
import { UsuarioModel } from 'src/app/model/usuario.model';

interface ConversaView {
  cdInteresse: number;
  nomeOutroUsuario: string;
  fotoOutroUsuario: string | null;
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
    IonSpinner
  ]
})
export class ConversasPage implements OnInit {

  usuarioLogado: UsuarioModel = new UsuarioModel();
  conversas: ConversaView[] = [];
  carregando: boolean = false;

  get solicitacoes(): ConversaView[] {
    return this.conversas.filter(c => !c.aceito && !c.finalizado);
  }

  get conversasAtivas(): ConversaView[] {
    return this.conversas.filter(c => c.aceito || c.finalizado);
  }

  constructor(
    private interesseService: InteresseService,
    private usuarioService: UsuarioService,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router,
  ) {
    addIcons({ chatbubblesOutline, checkmarkDoneOutline, closeOutline });
  }

  ngOnInit() { }

  ionViewWillEnter() {
    const possuiSessao = this.usuarioService.verificarSessao();

    if (!possuiSessao) {
      this.exibirMensagem('Não há usuário logado.');
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioLogado = this.usuarioService.getUsuarioSessao();
    this.carregarConversas();
  }

  carregarConversas() {
    this.carregando = true;

    this.interesseService.listarPorUsuario(this.usuarioLogado.cdUsuario).subscribe({
      next: (comoInteressado) => {

        this.interesseService.listarPorInteressados(this.usuarioLogado.cdUsuario).subscribe({
          next: (comoAnunciante) => {

            const todos = [...comoInteressado, ...comoAnunciante];
            const comConversa = todos.filter(i => i.conversaIniciada === true); // <-- MUDOU: filtra pela conversa, não pelo interesse

            const mapa = new Map<number, InteresseModel>();
            comConversa.forEach(i => mapa.set(i.id!, i));

            this.conversas = Array.from(mapa.values()).map(interesse => this.mapearConversa(interesse));
            this.carregando = false;
          },
          error: () => {
            this.carregando = false;
            this.exibirMensagem('Erro ao carregar conversas.');
          }
        });
      },
      error: () => {
        this.carregando = false;
        this.exibirMensagem('Erro ao carregar conversas.');
      }
    });
  }

  mapearConversa(interesse: InteresseModel): ConversaView {
    const souEuOInteressado = interesse.usuario.cdUsuario === this.usuarioLogado.cdUsuario;

    return {
      cdInteresse: interesse.id!,
      nomeOutroUsuario: souEuOInteressado
        ? interesse.anuncio.usuarioCria.nmUsuario
        : interesse.usuario.nmUsuario,
      fotoOutroUsuario: souEuOInteressado
        ? interesse.anuncio.usuarioCria.ftUsuario
        : interesse.usuario.ftUsuario,
      nmAnuncio: interesse.anuncio.nmAnuncio,
      finalizado: interesse.finalizado,
      souAnunciante: !souEuOInteressado, 
      aceito: interesse.aceito 
    };
  }

  abrirChat(conversa: ConversaView) {
    if (conversa.souAnunciante && !conversa.aceito) {
      return;
    }

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

    this.interesseService.aceitarInteresse(conversa.cdInteresse, this.usuarioLogado.cdUsuario).subscribe({
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
    this.interesseService.recusarConversa(conversa.cdInteresse, this.usuarioLogado.cdUsuario).subscribe({
      next: () => {
        this.conversas = this.conversas.filter(c => c.cdInteresse !== conversa.cdInteresse);
        this.exibirMensagem('Conversa recusada.');
      },
      error: () => this.exibirMensagem('Erro ao recusar a conversa.')
    });
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({ message: texto, duration: 2000 });
    toast.present();
  }
}