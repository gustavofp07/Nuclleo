import {
  Component,
  OnInit
} from '@angular/core';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonMenuButton,
  IonButtons,
  IonIcon,
  IonButton
} from '@ionic/angular/standalone';

import {
  CommonModule
} from '@angular/common';

import {
  RouterLink
} from '@angular/router';

//tirar
import {
  HttpClient
} from '@angular/common/http';

import {
  AlertController,
  ToastController
} from '@ionic/angular';

import {
  addIcons
} from 'ionicons';
import { add, settingsOutline, trashOutline } from 'ionicons/icons';

import { ComunidadeService } from 'src/app/services/comunidade.service';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { ComunidadeModel } from 'src/app/model/comunidade.model';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-minhas-comunidades',
  templateUrl: './minhas-comunidades.page.html',
  styleUrls: ['./minhas-comunidades.page.scss'],
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
    IonButton
  ]
})

export class MinhasComunidadesPage implements OnInit {
  usuario: UsuarioModel;
  comunidades: ComunidadeModel[];

  constructor(
    private comunidadeService: ComunidadeService,
    private alertController: AlertController,
    private toastController: ToastController,
    private usuarioService: UsuarioService) {
    this.usuario = new UsuarioModel();
    this.comunidades = [];
    addIcons({
      add,
      settingsOutline,
      trashOutline
    });
  }

  ngOnInit() {
    this.usuario = this.usuarioService.getUsuarioSessao();
    if (this.usuario) {
      this.carregarComunidades();
    }
  }

  ionViewWillEnter() {
    if (this.usuario) {
      this.carregarComunidades();
    }
  }

  carregarComunidades() {

    this.comunidadeService.listarComunidadesDoUsuario(this.usuario.cdUsuario).subscribe({
      next: async (comunidades: ComunidadeModel[]) => {
        //console.log("busquei ", comunidades);
        this.comunidades = comunidades;
      },
      error: async () => {
        //console.log('Erro ao logar');
        this.exibirMensagem('Erro ao carregar comunidades');
      }
    });

    /*
    const usuarioLogado =
      JSON.parse(
        localStorage.getItem(
          'usuarioAutenticado'
        ) || '{}'
      );

    this.http.get<any[]>(

      'http://localhost:8080/api/v1/comunidades/usuario/' +
      usuarioLogado.cdUsuario

    ).subscribe({

      next: (dados) => {

        this.comunidades = dados;

      },

      error: (erro) => {

        console.log(erro);

      }

    });
    */

  }

  async confirmarExclusao(comunidade: ComunidadeModel) {
    const alert =
      await this.alertController.create({
        header: 'Excluir comunidade',
        message:
          'Deseja realmente excluir esta comunidade?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Excluir',
            role: 'destructive',
            handler: () => {
              this.excluirComunidade(comunidade);
            }
          }
        ]
      });
    await alert.present();
  }

  excluirComunidade(comunidade: ComunidadeModel) {

    this.comunidadeService.excluir(comunidade.cdComunidade).subscribe({
      next: async (comunidade: ComunidadeModel) => {
        //console.log("busquei ", comunidades);
        this.exibirMensagem('Comunidade excluída com sucesso');
        this.carregarComunidades();
      },
      error: async () => {
        //console.log('Erro ao logar');
        this.exibirMensagem('Erro ao excluir comunidade.');
      }
    });

  }

  async exibirMensagem(mensagem: string) {
    const toast =
      await this.toastController.create({
        message: mensagem,
        duration: 2000,
        position: 'top'
      });
    await toast.present();
  }
}