import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  IonContent,
  IonLabel,
  IonAvatar,
  IonItem,
  IonButton,
  IonCardSubtitle,
  IonCardTitle,
  IonCard,
  IonCardHeader,
  IonList,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonButtons,
  IonIcon
} from '@ionic/angular/standalone';

import { Router } from '@angular/router';

import { UsuarioService } from 'src/app/services/usuario.service';

import { ToastController } from '@ionic/angular';

import { HttpClient } from '@angular/common/http';

import { AnuncioModel } from 'src/app/model/anuncio.model';
import { AnuncioService } from 'src/app/services/anuncio.service';

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
    IonMenuButton,
    IonButtons,
    CommonModule,
    FormsModule,
    IonButton,
    RouterLink,
    IonIcon
  ]
})

export class TelaInicialPage implements OnInit {

  comunidades: any[] = [];
  anunciosRecomendados: AnuncioModel[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private toastController: ToastController,
    private http: HttpClient,
    private anuncioService: AnuncioService,
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
    this.carregarAnunciosRecomendados();
  }

  carregarComunidades() {

    this.http.get<any[]>(
      'https://nuclleo.onrender.com/api/v1/comunidades'
    ).subscribe({
      next: (dados) => {

        this.comunidades = dados;

        //console.log(this.comunidades);

      },
      error: (erro) => {
        console.log(erro);
      }

    });

  }

  carregarAnunciosRecomendados() {
    this.anuncioService.listarTodos().subscribe({
      next: (dados) => {
        this.anunciosRecomendados = dados
          .sort(() => Math.random() - 0.5)
          .slice(0, 5);
      },
      error: () => {
        console.log('Erro ao carregar anúncios recomendados.');
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