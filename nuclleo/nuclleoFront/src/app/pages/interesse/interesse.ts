import { Component } from '@angular/core';
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
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { heartOutline, imageOutline } from 'ionicons/icons';

import { InteresseModel } from 'src/app/model/interesse.model';
import { AnuncioModel } from 'src/app/model/anuncio.model';
import { TokenModel } from 'src/app/model/token.model';
import { InteresseService } from 'src/app/services/interesse.service';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-interesse',
  templateUrl: './interesse.page.html',
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
    IonSpinner
  ]
})
export class InteresseMeusPage {
  token: TokenModel;
  interesses: InteresseModel[] = [];
  carregandoInteresses: boolean = true;

  constructor(
    private interesseService: InteresseService,
    private toastController: ToastController,
    private router: Router,
    private tokenService: TokenService
  ) {
    this.token = new TokenModel();
    addIcons({ heartOutline, imageOutline });
  }

  ionViewWillEnter() {
    if (!this.tokenService.temToken()) {
      this.exibirMensagem('Não há usuário logado.');
      this.router.navigate(['/login']);
      return;
    }

    this.token = this.tokenService.extrair();
    this.carregarInteresses();
  }

  rotuloTipoAnuncio(tipo: string): string {
    return tipo === 'REQUERIMENTO' ? 'Compra' : 'Venda';
  }

  onErroImagem(anuncio: AnuncioModel) {
    anuncio.ftAnuncio = '';
  }

  carregarInteresses() {
    this.carregandoInteresses = true;

    this.interesseService.listarPorUsuario(this.token.cdUsuario).subscribe({
      next: (interesses) => {
        this.interesses = interesses;
        this.carregandoInteresses = false;
      },
      error: () => {
        this.carregandoInteresses = false;
        this.exibirMensagem('Erro ao carregar seus interesses.');
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
