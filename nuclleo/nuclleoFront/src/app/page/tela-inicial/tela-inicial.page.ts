import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonLabel, IonAvatar, IonItem, IonCardSubtitle, IonCardTitle, IonCard, IonCardHeader,
  IonList, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonMenuButton, IonButtons, IonIcon, IonMenu
} from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';

import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tela-inicial',
  templateUrl: './tela-inicial.page.html',
  styleUrls: ['./tela-inicial.page.scss'],
  standalone: true,
  imports: [IonContent, RouterLink, IonLabel, IonAvatar, IonItem, IonCardSubtitle, IonCardTitle, IonCard, IonCardHeader,
    IonList, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonMenuButton, IonButtons, IonIcon, IonMenu, CommonModule, FormsModule]
})
export class TelaInicialPage implements OnInit {

  constructor(private usuarioService: UsuarioService,
    private router: Router,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    /*
    let aux = this.usuarioService.verificarSessao();
    if (aux == false) {
      this.exibirMensagem("Não há usuário logado.");
      this.router.navigate(['/login']);
    }
      */
  }

  ionViewWillEnter() {
    let aux = this.usuarioService.verificarSessao();
    if (aux == false) {
      this.exibirMensagem("Não há usuário logado.");
      this.router.navigate(['/login']);
    }
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 2000
    });
    toast.present();
  }
}
