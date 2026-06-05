import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonMenuButton } from '@ionic/angular/standalone';

import { ActivatedRoute } from '@angular/router';

import { ToastController } from '@ionic/angular';
import { AnuncioModel } from 'src/app/model/anuncio.model';
import { AnuncioComunidadeService } from 'src/app/services/anuncio-comunidade.service';
import { ComunidadeModel } from 'src/app/model/comunidade.model';
import { ComunidadeService } from 'src/app/services/comunidade.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UsuarioComunidadeService } from 'src/app/services/usuario-comunidade.service';
import { UsuarioComunidadeModel } from 'src/app/model/usuario-comunidade.model';

@Component({
  selector: 'app-comunidade-tela',
  templateUrl: './comunidade-tela.page.html',
  styleUrls: ['./comunidade-tela.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonMenuButton, CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar]
})
export class ComunidadePerfilPage implements OnInit {

  comunidade: ComunidadeModel;
  abaSelecionada: 'perfil' | 'chat' | 'anuncios' = 'perfil';

  anuncios: AnuncioModel[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private comunidadeService: ComunidadeService,
    private usuarioService: UsuarioService,
    private usuarioComunidadeService: UsuarioComunidadeService,
    private anuncioComunidadeService: AnuncioComunidadeService,
    private toastController: ToastController,
  ) {
    this.comunidade = new ComunidadeModel();
  }

  ngOnInit() {
  }

  ionViewWillEnter() {

    const cdComunidade = Number(this.activatedRoute.snapshot.paramMap.get('cdComunidade'));

    this.comunidadeService.buscarComunidade(cdComunidade).subscribe({
      next: (comunidade) => {
        this.comunidade = comunidade;
      },
      error: () => {
        this.exibirMensagem(
          'Erro ao carregar comunidade.'
        );
      }
    });
  }

  entrarComunidade() {
    //mudar isso. Tá parecendo gambiarra.
    const usuarioComunidade = new UsuarioComunidadeModel();
    usuarioComunidade.usuario = this.usuarioService.getUsuarioSessao();
    usuarioComunidade.comunidade = this.comunidade;

    this.usuarioComunidadeService.cadastrar(usuarioComunidade).subscribe({
      next: (UsuarioComunidade) => {
        console.log(UsuarioComunidade);
        this.exibirMensagem('Você entrou na comunidade!');
      },
      error: (error) => {
        console.error(error);
        this.exibirMensagem('Erro ao entrar na comunidade.');
      }
    });

  }

  selecionarAba(aba: 'perfil' | 'chat' | 'anuncios') {

    this.abaSelecionada = aba;

    if (
      aba === 'anuncios' &&
      this.anuncios.length === 0
    ) {

      this.carregarAnuncios();

    }

  }

  carregarAnuncios() {

    this.anuncioComunidadeService
      .listarAnunciosDaComunidade(
        this.comunidade.cdComunidade
      )
      .subscribe({
        next: (dados) => {
          this.anuncios = dados;
        },

        error: () => {
          this.exibirMensagem(
            'Erro ao carregar anúncios.'
          );
        }
      });

  }

  async exibirMensagem(msg: string) {
    const toast =
      await this.toastController.create({
        message: msg,
        duration: 2000,
        position: 'top'
      });
    await toast.present();
  }

}