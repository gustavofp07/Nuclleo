import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonButtons,
  IonIcon,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonBadge
} from '@ionic/angular/standalone';

import { AlertController, ToastController } from '@ionic/angular';

import { addIcons } from 'ionicons';
import { heartOutline, peopleOutline, chevronForwardOutline, chatbubbleOutline, checkmarkDoneOutline, imageOutline } from 'ionicons/icons';

import { InteresseService } from 'src/app/services/interesse.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { InteresseModel } from 'src/app/model/interesse.model';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { AnuncioModel } from 'src/app/model/anuncio.model';

interface InteressadoComInteresse {
  usuario: UsuarioModel;
  cdInteresse: number;
}

interface AnuncioComInteresse {
  anuncio: AnuncioModel;
  interessados: InteressadoComInteresse[];
}

@Component({
  selector: 'app-interesse',
  templateUrl: './interesse.page.html',
  styleUrls: ['./interesse.page.scss'],
  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonMenuButton,
    IonButtons,
    IonIcon,
    IonButton,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonBadge
  ]
})
export class InteresseMeusPage implements OnInit {
  usuario: UsuarioModel;
  interesses: InteresseModel[] = [];

  anunciosComInteresse: AnuncioComInteresse[] = [];
  totalInteressesRecebidos: number = 0;
  segmentoAtivo: 'meus' | 'recebidos' = 'meus';

  constructor(
    private interesseService: InteresseService,
    private usuarioService: UsuarioService,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router,
  ) {
    this.usuario = new UsuarioModel();
    addIcons({
      heartOutline,
      peopleOutline,
      chevronForwardOutline,
      chatbubbleOutline,
      checkmarkDoneOutline,
      imageOutline,
    });
  }

  ngOnInit() {
    this.usuario = this.usuarioService.getUsuarioSessao();
  }

  ionViewWillEnter() {

    const possuiSessao = this.usuarioService.verificarSessao();

    if (!possuiSessao) {

      this.exibirMensagem('Não há usuário logado.');

      this.router.navigate(['/login']);

      return;
    }

    this.usuario = this.usuarioService.getUsuarioSessao();

    this.carregarInteresses();
    this.carregarInteressesRecebidos();
  }

  onSegmentChange(event: any) {
    this.segmentoAtivo = event.detail.value;
  }

  onErroImagem(anuncio: any) {
    anuncio.ftAnuncio = null;
  }

  carregarInteresses() {
    this.interesseService.listarPorUsuario(this.usuario.cdUsuario).subscribe({
      next: (interesses) => {
        this.interesses = interesses;
      },
      error: () => {
        this.exibirMensagem('Erro ao carregar seus interesses.');
      }
    });
  }

  carregarInteressesRecebidos() {
    this.interesseService.listarPorInteressados(this.usuario.cdUsuario).subscribe({
      next: (interesses) => {
        const pendentes = interesses.filter(i => !(i as any).aceito);
        this.anunciosComInteresse = this.agruparPorAnuncio(pendentes);

        this.totalInteressesRecebidos = pendentes.length;   // <-- NOVO
      },
      error: () => {
        this.exibirMensagem('Erro ao carregar interesses recebidos.');
      }
    });
  }

  agruparPorAnuncio(interesses: InteresseModel[]): AnuncioComInteresse[] {
    const mapa = new Map<number, AnuncioComInteresse>();

    for (const interesse of interesses) {
      const cdAnuncio = interesse.anuncio.cdAnuncio;

      if (!mapa.has(cdAnuncio)) {
        mapa.set(cdAnuncio, { anuncio: interesse.anuncio, interessados: [] });
      }

      mapa.get(cdAnuncio)!.interessados.push({
        usuario: (interesse as any).usuario,
        cdInteresse: interesse.id!
      });
    }

    return Array.from(mapa.values());
  }
  async confirmarRemocao(interesse: InteresseModel) {
    const alert = await this.alertController.create({
      header: 'Remover interesse',
      message: 'Deseja realmente remover este interesse?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Remover',
          role: 'destructive',
          handler: () => {
            this.removerInteresse(interesse);
          }
        }
      ]
    });

    await alert.present();
  }

  aceitarChat(anuncioItem: AnuncioComInteresse, interessado: InteressadoComInteresse) {

    this.interesseService.aceitarInteresse(interessado.cdInteresse, this.usuario.cdUsuario).subscribe({

      next: () => {

        anuncioItem.interessados = anuncioItem.interessados.filter(
          i => i.cdInteresse !== interessado.cdInteresse
        );

        this.totalInteressesRecebidos--;   // <-- NOVO

        if (anuncioItem.interessados.length === 0) {
          this.anunciosComInteresse = this.anunciosComInteresse.filter(
            item => item.anuncio.cdAnuncio !== anuncioItem.anuncio.cdAnuncio
          );
        }

        this.router.navigate(['/chat', interessado.cdInteresse]);
      },

      error: () => {
        this.exibirMensagem('Erro ao aceitar solicitação de chat.');
      }
    });
  }

  removerInteresse(interesse: InteresseModel) {
    if (!interesse.id) {
      return;
    }

    this.interesseService.excluirInteresse(interesse.id).subscribe({
      next: () => {
        this.exibirMensagem('Interesse removido.');
        this.carregarInteresses();
      },
      error: () => {
        this.exibirMensagem('Erro ao remover interesse.');
      }
    });
  }

  trackByAnuncio(index: number, item: AnuncioComInteresse): number {
    return item.anuncio.cdAnuncio;
  }

  trackByInteressado(index: number, item: InteressadoComInteresse): number {
    return item.cdInteresse;
  }

  irParaPerfil(cdUsuario: number) {
    this.router.navigate(['/usuario-perfil', cdUsuario]);
  }

  irParaChat(event: Event, cdInteresse: number) {
    event.stopPropagation();
    this.router.navigate(['/chat', cdInteresse]);
  }

  async exibirMensagem(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2000,
      position: 'top'
    });
    await toast.present();
  }
}