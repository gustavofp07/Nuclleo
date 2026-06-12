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
import { ToastController } from '@ionic/angular';

import { AnuncioModel } from 'src/app/model/anuncio.model';
import { AnuncioService } from 'src/app/services/anuncio.service';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { AnuncioComunidadeService } from 'src/app/services/anuncio-comunidade.service';

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
    private toastController: ToastController,
    private usuarioService: UsuarioService,
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

  async exibirMensagem(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      position: 'top'
    });

    await toast.present();
  }

}