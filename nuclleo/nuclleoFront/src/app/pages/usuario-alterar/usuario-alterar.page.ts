import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonLabel,
  AlertController
} from '@ionic/angular/standalone';

import { Router } from '@angular/router';

import { addIcons } from 'ionicons';

import {
  chevronBackOutline,
  eyeOffOutline,
  eyeOutline,
  imageOutline
} from 'ionicons/icons';

import { UsuarioModel } from 'src/app/model/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-usuario-alterar',
  templateUrl: './usuario-alterar.page.html',
  styleUrls: ['./usuario-alterar.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonLabel
  ]
})
export class UsuarioAlterarPage implements OnInit {

  usuario: UsuarioModel;

  previewFoto: string | ArrayBuffer | null = null;

  imagemSelecionada?: File;

  showPassword: boolean = false;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private alertController: AlertController
  ) {

    addIcons({
      chevronBackOutline,
      eyeOutline,
      eyeOffOutline,
      imageOutline
    });

    this.usuario = new UsuarioModel();
  }

  ngOnInit() {

    if (localStorage.getItem('usuarioAutenticado')) {

      const usuarioLogado: UsuarioModel =
        JSON.parse(
          localStorage.getItem('usuarioAutenticado') || ''
        );

      this.buscarUsuario(usuarioLogado.cdUsuario);

    } else {

      console.log(
        'Não tem nenhum usuário autenticado no momento.'
      );
    }
  }

  ionViewWillEnter() {

    const possuiSessao =
      this.usuarioService.verificarSessao();

    if (!possuiSessao) {

      this.router.navigate(['/login']);
      return;
    }

    const usuarioLogado =
      this.usuarioService.getUsuarioSessao();

    this.buscarUsuario(usuarioLogado.cdUsuario);
  }

  private buscarUsuario(cdUsuario: number) {

    this.usuarioService
      .buscarUsuario(cdUsuario)
      .subscribe({

        next: (usuario: UsuarioModel) => {

          console.log('busquei ', usuario);

          this.usuario = usuario;

          this.previewFoto = null;
          this.imagemSelecionada = undefined;
        },

        error: () => {

          console.log('Erro ao buscar usuário');
        }
      });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  selecionarImagem(event: Event) {

    const input =
      event.target as HTMLInputElement;

    const arquivo =
      input.files?.[0];

    if (!arquivo) {
      return;
    }

    const tiposPermitidos = [
      'image/jpeg',
      'image/png'
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {

      input.value = '';

      this.exibirMensagem(
        'Selecione apenas imagens JPG, JPEG ou PNG.'
      );

      return;
    }

    this.imagemSelecionada = arquivo;

    const reader = new FileReader();

    reader.onload = () => {
      this.previewFoto = reader.result;
    };

    reader.readAsDataURL(arquivo);
  }

  salvarAlteracoes() {

    this.usuarioService
      .atualizar(
        this.usuario,
        this.imagemSelecionada
      )
      .subscribe({

        next: (usuario: UsuarioModel) => {

          console.log(
            'atualizou ',
            usuario
          );

          this.usuarioService
            .salvarUsuarioSessao(usuario);

          this.router.navigate([
            '/usuario-perfil'
          ]);
        },

        error: async (erro) => {

          console.error(
            'Erro! ',
            erro.error?.message
          );

          await this.exibirMensagem(
            erro.error?.message
            || 'Erro ao atualizar usuário.'
          );
        }
      });
  }

  async confirmarAlteracoes() {

    const alert =
      await this.alertController.create({

        header: 'Confirmar Alterações',

        message:
          'Deseja realmente salvar as alterações?',

        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Salvar',
            role: 'confirm',
            handler: () => {
              this.salvarAlteracoes();
            }
          }
        ]
      });

    await alert.present();
  }

  async exibirMensagem(mensagem: string) {

    const alert =
      await this.alertController.create({

        header: 'Aviso',
        message: mensagem,
        buttons: ['OK']
      });

    await alert.present();
  }

  cancelar() {

    this.router.navigate([
      '/usuario-perfil'
    ]);
  }
}