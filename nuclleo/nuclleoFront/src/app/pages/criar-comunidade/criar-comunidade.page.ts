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
    private toastController: ToastController
  ) {

    this.comunidade = new ComunidadeModel();

  }

  async criarComunidade() {

    let comunidades =
      JSON.parse(
        localStorage.getItem('comunidades') || '[]'
      );

    comunidades.push(this.comunidade);

    localStorage.setItem(
      'comunidades',
      JSON.stringify(comunidades)
    );

    const toast =
      await this.toastController.create({

        message: 'Comunidade criada!',
        duration: 2000

      });

    toast.present();

    this.router.navigate(['/minhas-comunidades']);

  }

}