import { Component } from '@angular/core';

import {
  IonContent,
  IonInput,
  IonItem,
  IonButton,
  ToastController
} from '@ionic/angular/standalone';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';

import { ComunidadeModel } from 'src/app/model/comunidade.model';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-criar-comunidade',
  templateUrl: './criar-comunidade.page.html',
  styleUrls: ['./criar-comunidade.page.scss'],
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,

    IonContent,
    IonInput,
    IonItem,
    IonButton
  ]
})

export class CriarComunidadePage {

  comunidade: ComunidadeModel;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private http: HttpClient
  ) {

    this.comunidade = new ComunidadeModel();

  }

  async criarComunidade() {

  const usuarioLogado =
    JSON.parse(
      localStorage.getItem('usuarioAutenticado') || '{}'
    );

  const comunidadeEnviar = {

    nmComunidade: this.comunidade.nmComunidade,

    descricao: this.comunidade.descricao,

    dtCriacao: new Date(),

    usuarioCria: {
      cdUsuario: Number(usuarioLogado.cdUsuario)
    }

  };

  console.log(comunidadeEnviar);

  this.http.post(
    'http://localhost:8080/api/v1/comunidades',
    comunidadeEnviar
  ).subscribe({

    next: async (resposta) => {

      console.log('CRIADO:', resposta);

      const toast =
        await this.toastController.create({

          message: 'Comunidade criada!',
          duration: 2000,
          color: 'success'

        });

      await toast.present();

      this.router.navigate([
        '/minhas-comunidades'
      ]);

    },

    error: async (erro) => {

      console.log('ERRO BACKEND:', erro.error);

      const toast =
        await this.toastController.create({

          message:
            'Erro ao criar comunidade!',
          duration: 3000,
          color: 'danger'

        });

      await toast.present();

    }

  });

}

}