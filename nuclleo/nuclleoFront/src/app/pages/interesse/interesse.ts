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
  IonSpinner
} from '@ionic/angular/standalone';

import { AlertController, ToastController } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { heartOutline, imageOutline } from 'ionicons/icons';

import { InteresseService } from 'src/app/services/interesse.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { InteresseModel } from 'src/app/model/interesse.model';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { TokenService } from 'src/app/services/token.service';
import { TokenModel } from 'src/app/model/token.model';

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
    IonSpinner
  ]
})
export class InteresseMeusPage implements OnInit {
  token: TokenModel;

  interesses: InteresseModel[] = [];
  carregandoInteresses: boolean = true;

  constructor(
    private interesseService: InteresseService,
    //private usuarioService: UsuarioService,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router,
    private tokenService: TokenService
  ) {
    this.token = new TokenModel();
    addIcons({ heartOutline, imageOutline });
  }

  ngOnInit() {
    this.token = this.tokenService.extrair();
    //this.usuario = this.usuarioService.getUsuarioSessao();
  }

  ionViewWillEnter() {
    this.token = this.tokenService.extrair();
    const possuiSessao = this.tokenService.temToken();

    if (!possuiSessao) {
      this.exibirMensagem('Não há usuário logado.');
      this.router.navigate(['/login']);
      return;
    }

    //this.usuario = this.usuarioService.getUsuarioSessao();
    this.carregarInteresses();
  }

  rotuloTipoAnuncio(tipo: string): string {
    return tipo === 'REQUERIMENTO' ? 'COMPRA' : 'VENDA';
  }

  onErroImagem(anuncio: any) {
    anuncio.ftAnuncio = null;
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

  irParaPerfil(cdUsuario: number) {
    this.router.navigate(['/usuario-perfil', cdUsuario]);
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