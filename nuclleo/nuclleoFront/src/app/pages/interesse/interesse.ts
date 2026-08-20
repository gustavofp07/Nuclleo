import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
import { heartOutline, peopleOutline, chevronForwardOutline } from 'ionicons/icons';

import { InteresseService } from 'src/app/services/interesse.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { InteresseModel } from 'src/app/model/interesse.model';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { AnuncioModel } from 'src/app/model/anuncio.model';

interface AnuncioComInteresse {
  anuncio: AnuncioModel;
  interessados: UsuarioModel[];
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
  segmentoAtivo: 'meus' | 'recebidos' = 'meus';

  constructor(
    private interesseService: InteresseService,
    private usuarioService: UsuarioService,
    private alertController: AlertController,
    private toastController: ToastController,
  ) {
    this.usuario = new UsuarioModel();
    addIcons({
      heartOutline,
      peopleOutline,
      chevronForwardOutline
    });
  }

  ngOnInit() {
    this.usuario = this.usuarioService.getUsuarioSessao();
  }

  ionViewWillEnter() {
    if (this.usuario) {
      this.carregarInteresses();
      this.carregarInteressesRecebidos();
    }
  }

  onSegmentChange(event: any) {
    this.segmentoAtivo = event.detail.value;
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
        this.anunciosComInteresse = this.agruparPorAnuncio(interesses);
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

      mapa.get(cdAnuncio)!.interessados.push((interesse as any).usuario);
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

  async exibirMensagem(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2000,
      position: 'top'
    });
    await toast.present();
  }
}