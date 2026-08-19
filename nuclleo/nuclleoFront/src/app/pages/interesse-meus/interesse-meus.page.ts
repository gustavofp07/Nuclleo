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
  IonButton
} from '@ionic/angular/standalone';

import { AlertController, ToastController } from '@ionic/angular';

import { addIcons } from 'ionicons';
import { heartOutline, trashOutline } from 'ionicons/icons';

import { InteresseService } from 'src/app/services/interesse.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { InteresseModel } from 'src/app/model/interesse.model';
import { UsuarioModel } from 'src/app/model/usuario.model';

@Component({
  selector: 'app-interesse-meus',
  templateUrl: './interesse-meus.page.html',
  styleUrls: ['./interesse-meus.page.scss'],
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
    IonButton
  ]
})
export class InteresseMeusPage implements OnInit {
  usuario: UsuarioModel;
  interesses: InteresseModel[] = [];

  constructor(
    private interesseService: InteresseService,
    private usuarioService: UsuarioService,
    private alertController: AlertController,
    private toastController: ToastController,
  ) {
    this.usuario = new UsuarioModel();
    addIcons({
      heartOutline,
      trashOutline
    });
  }

  ngOnInit() {
    this.usuario = this.usuarioService.getUsuarioSessao();
  }

  ionViewWillEnter() {
    if (this.usuario) {
      this.carregarInteresses();
    }
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

  async confirmarRemocao(interesse: InteresseModel) {
    const alert = await this.alertController.create({
      header: 'Remover interesse',
      message: 'Deseja realmente remover este interesse?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
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