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
  AlertController,
  ActionSheetController
} from '@ionic/angular/standalone';

import { CameraSource } from '@capacitor/camera';

import { Router } from '@angular/router';

import { addIcons } from 'ionicons';

import {
  chevronBackOutline,
  imageOutline,
  cameraOutline
} from 'ionicons/icons';

import { UsuarioModel } from 'src/app/model/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ArquivoService } from 'src/app/services/arquivo.service';

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
  senhaOriginal: string = '';

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private alertController: AlertController,
    private arquivoService: ArquivoService,
    private actionSheetController: ActionSheetController
  ) {

    addIcons({
      chevronBackOutline,
      imageOutline,
      cameraOutline
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

          this.senhaOriginal = usuario.senha;
        },

        error: () => {

          console.log('Erro ao buscar usuário');
        }
      });
  }

  async selecionarImagem() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Foto',
      buttons: [
        {
          text: 'Câmera',
          icon: 'camera-outline',
          handler: () => this.capturarImagem(CameraSource.Camera)
        },
        {
          text: 'Galeria',
          icon: 'image-outline',
          handler: () => this.capturarImagem(CameraSource.Photos)
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  private async capturarImagem(source: CameraSource) {
    const arquivo = await this.arquivoService.capturar(source);

    if (!arquivo) {
      return;
    }

    const tiposPermitidos = [
      'image/jpeg',
      'image/png'
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
      await this.exibirMensagem('Selecione apenas imagens JPG, JPEG ou PNG.');
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

    this.usuarioService.atualizar(this.usuario, this.imagemSelecionada).subscribe({
      next: (usuario: UsuarioModel) => {
        console.log('atualizou ', usuario);
        this.usuarioService.salvarUsuarioSessao(usuario);

        this.router.navigate([
          '/usuario-perfil'
        ]);
      },

      error: async (erro) => {

        const mensagem =
          erro.error?.message
          || (typeof erro.error === 'string' ? erro.error : '')
          || erro.message
          || 'Erro ao atualizar usuário.';

        console.error(
          'Erro! ',
          mensagem,
          erro
        );

        await this.exibirMensagem(
          mensagem
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

  async abrirAlterarSenha() {

    const alert =
      await this.alertController.create({

        header: 'Alterar senha',

        message:
          'Informe a senha atual e a nova senha para confirmar a alteração.',

        inputs: [
          {
            name: 'senhaAtual',
            type: 'password',
            placeholder: 'Senha atual'
          },
          {
            name: 'novaSenha',
            type: 'password',
            placeholder: 'Nova senha'
          },
          {
            name: 'confirmarNovaSenha',
            type: 'password',
            placeholder: 'Confirmar nova senha'
          }
        ],

        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Confirmar',
            role: 'confirm',
            handler: async (dados) => {

              if (!dados.senhaAtual || dados.senhaAtual !== this.senhaOriginal) {
                await this.exibirMensagem('Senha atual incorreta.');
                return false;
              }

              if (!dados.novaSenha) {
                await this.exibirMensagem('Informe a nova senha.');
                return false;
              }

              if (dados.novaSenha !== dados.confirmarNovaSenha) {
                await this.exibirMensagem('A confirmação não corresponde à nova senha.');
                return false;
              }

              this.usuario.senha = dados.novaSenha;
              this.salvarSenha();

              return true;
            }
          }
        ]
      });

    await alert.present();
  }

  salvarSenha() {

    this.usuarioService.atualizar(this.usuario, this.imagemSelecionada).subscribe({

      next: async (usuario: UsuarioModel) => {

        console.log('senha atualizada ', usuario);

        this.usuarioService.salvarUsuarioSessao(usuario);

        this.usuario = usuario;
        this.senhaOriginal = usuario.senha;

        await this.exibirMensagem('Senha alterada com sucesso!');
      },

      error: async (erro) => {

        const mensagem =
          erro.error?.message
          || (typeof erro.error === 'string' ? erro.error : '')
          || erro.message
          || 'Erro ao atualizar senha.';

        console.error(
          'Erro! ',
          mensagem,
          erro
        );

        await this.exibirMensagem(
          mensagem
        );
      }
    });
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