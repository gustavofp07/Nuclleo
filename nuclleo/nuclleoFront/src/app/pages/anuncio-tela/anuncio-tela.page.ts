import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonButton
} from '@ionic/angular/standalone';

import { ActivatedRoute, RouterLink } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';

import { AnuncioModel } from 'src/app/model/anuncio.model';
import { AnuncioService } from 'src/app/services/anuncio.service';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { AnuncioComunidadeService } from 'src/app/services/anuncio-comunidade.service';
import { InteresseService } from 'src/app/services/interesse.service';

@Component({
  selector: 'app-anuncio-tela',
  templateUrl: './anuncio-tela.page.html',
  styleUrls: ['./anuncio-tela.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonIcon,
    IonButton
  ]
})
export class AnuncioTelaPage implements OnInit {

  anuncio: AnuncioModel = new AnuncioModel();
  usuarioLogado: UsuarioModel = new UsuarioModel();
  usuarioEhDono: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private anuncioService: AnuncioService,
    private interesseService: InteresseService,
    private toastController: ToastController,
    private usuarioService: UsuarioService,
    private alertController: AlertController,
    private router: Router,
    private anuncioComunidadeService: AnuncioComunidadeService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    const cdAnuncio = Number(
      this.activatedRoute.snapshot.paramMap.get('cdAnuncio')
    );

    this.anuncioService.buscarAnuncio(cdAnuncio).subscribe({
      next: (anuncio) => {
        this.anuncio = anuncio;
        this.usuarioLogado = this.usuarioService.getUsuarioSessao();
        this.usuarioEhDono =
          this.anuncio.usuarioCria.cdUsuario === this.usuarioLogado.cdUsuario;
      },
      error: () => {
        this.exibirMensagem('Erro ao carregar anúncio.');
      }
    });
  }

  excluirAnuncio() {

    this.anuncioComunidadeService
      .excluirRelacoesPorAnuncio(this.anuncio.cdAnuncio)
      .subscribe({
        next: () => {

          this.anuncioService.excluirAnuncio(this.anuncio.cdAnuncio).subscribe({
            next: () => {
              this.exibirMensagem('Anúncio excluído com sucesso.');
              this.router.navigate(['/usuario-perfil']);
            },
            error: () => {
              this.exibirMensagem('Erro ao excluir anúncio.');
            }
          });

        },
        error: () => {
          this.exibirMensagem('Erro ao remover anúncio das comunidades.');
        }
      });

  }

  registrarInteresse() {
    const interesse = {
      cdUsuario: this.usuarioLogado.cdUsuario,
      cdAnuncio: this.anuncio.cdAnuncio
    };

    this.interesseService.registrarInteresse(interesse).subscribe({
      next: (Interesse: any) => {
        this.exibirMensagem('Interesse registrado com sucesso.');
      },
      error: (erro: any) => {
        this.exibirMensagem('Erro! ' + erro.error.message);
      }
    });
  }

  async confirmarExclusao() {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: 'Deseja realmente excluir este anúncio?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.excluirAnuncio();
          }
        }
      ]
    });

    await alert.present();
  }

  async confirmarInteresse() {
    const alert = await this.alertController.create({
      header: 'Confirmar Interesse',
      message: 'Deseja realmente manifestar interesse neste anúncio?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          role: 'confirm',
          handler: () => {
            this.registrarInteresse();
          }
        }
      ]
    });

    await alert.present();
  }


  async exibirMensagem(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      position: 'top'
    });

    await toast.present();
  }

}