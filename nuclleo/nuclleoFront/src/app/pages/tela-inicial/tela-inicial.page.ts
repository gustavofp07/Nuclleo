import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonLabel,
  IonAvatar,
  IonItem,
  IonCardSubtitle,
  IonCardTitle,
  IonCard,
  IonCardHeader,
  IonList,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonMenuButton,
  IonButtons
} from '@ionic/angular/standalone';

import { Router } from '@angular/router';

import { UsuarioService } from 'src/app/services/usuario.service';

import { ToastController } from '@ionic/angular';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tela-inicial',
  templateUrl: './tela-inicial.page.html',
  styleUrls: ['./tela-inicial.page.scss'],
  standalone: true,

  imports: [
    IonContent,
    IonLabel,
    IonAvatar,
    IonItem,
    IonCardSubtitle,
    IonCardTitle,
    IonCard,
    IonCardHeader,
    IonList,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSearchbar,
    IonMenuButton,
    IonButtons,
    CommonModule,
    FormsModule
  ]
})

export class TelaInicialPage implements OnInit {

  comunidades: any[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private toastController: ToastController,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.carregarComunidades();
  }

  ionViewWillEnter() {

    let aux = this.usuarioService.verificarSessao();

    if (aux == false) {

      this.exibirMensagem(
        "Não há usuário logado."
      );

      this.router.navigate(['/login']);

      return;

    }

    this.carregarComunidades();

  }

  carregarComunidades() {

    this.http.get<any[]>(
      'http://localhost:8080/api/v1/comunidades'
    ).subscribe({

      next: (dados) => {

        this.comunidades = dados;

        console.log(this.comunidades);

      },

      error: (erro) => {

        console.log(erro);

      }

    });

  }

  async exibirMensagem(texto: string) {

    const toast =
      await this.toastController.create({

        message: texto,
        duration: 2000

      });

    toast.present();

  }

}