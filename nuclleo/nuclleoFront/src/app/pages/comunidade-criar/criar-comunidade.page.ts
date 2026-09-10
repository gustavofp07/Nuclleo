import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import {
  IonContent,
  IonInput,
  IonItem,
  IonButton,
  ToastController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  ActionSheetController
} from '@ionic/angular/standalone';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ComunidadeModel } from 'src/app/model/comunidade.model';
import { ComunidadeService } from 'src/app/services/comunidade.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UsuarioComunidadeModel } from 'src/app/model/usuario-comunidade.model';
import { UsuarioComunidadeService } from 'src/app/services/usuario-comunidade.service';
import { ArquivoService } from 'src/app/services/arquivo.service';

import { CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import { cameraOutline, imageOutline } from 'ionicons/icons';

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
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton
  ]
})

export class CriarComunidadePage {

  modoEdicao: boolean = false;
  salvando: boolean = false;
  comunidade: ComunidadeModel;

  // PREVIEW DA FOTO
  previewFoto: string | ArrayBuffer | null = null;
  imagemSelecionada?: File;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private activatedRoute: ActivatedRoute,
    private comunidadeService: ComunidadeService,
    private usuarioService: UsuarioService,
    private usuarioComunidadeService: UsuarioComunidadeService,
    private arquivoService: ArquivoService,
    private actionSheetController: ActionSheetController
  ) {

    addIcons({
      cameraOutline,
      imageOutline
    });

    this.comunidade = new ComunidadeModel();

  }

  ngOnInit() {
  }

  ionViewWillEnter() {

    this.comunidade = new ComunidadeModel();
    this.previewFoto = null;
    this.imagemSelecionada = undefined;
    this.salvando = false;   // <-- NOVO

    const cdComunidade =
      this.activatedRoute.snapshot.paramMap.get('cdComunidade');

    if (cdComunidade) {

      this.modoEdicao = true;

      this.comunidadeService.buscarComunidade(Number(cdComunidade)).subscribe({
        next: async (comunidade: ComunidadeModel) => {
          this.comunidade = comunidade;
        },
        error: async () => {
          this.exibirMensagem('Erro ao carregar comunidade.');
        }
      });

    }

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

    if (arquivo.type !== 'image/png' && arquivo.type !== 'image/jpeg') {

      this.exibirMensagem(
        'Selecione apenas imagens PNG ou JPG.'
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

  salvarComunidade() {
    if (this.salvando) {
      return;
    }

    //limpa o CEP para validar ele
    const cepLimpo = this.comunidade.cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      this.exibirMensagem('Informe um CEP válido com 8 dígitos.');
      return;
    }

    this.comunidade.cep = cepLimpo;

    this.salvando = true;

    if (this.modoEdicao) {
      this.atualizarComunidade();
    } else {
      this.cadastrarComunidade();
    }
  }

  async atualizarComunidade() {

    this.comunidadeService.atualizarComunidade(this.comunidade, this.imagemSelecionada).subscribe({
      next: async (comunidade: ComunidadeModel) => {

        this.exibirMensagem('Comunidade atualizada com sucesso!');

        this.router.navigate(['/minhas-comunidades']);

      },

      error: async () => {
        this.salvando = false;
        this.exibirMensagem('Erro ao atualizar comunidade.');
      }

    });

  }

  async cadastrarComunidade() {
    this.comunidade.usuarioCria = this.usuarioService.getUsuarioSessao();

    this.comunidadeService.cadastrarComunidade(this.comunidade, this.imagemSelecionada).subscribe({
      next: async (comunidade: ComunidadeModel) => {
        this.exibirMensagem('Comunidade criada com sucesso!');
        this.router.navigate(['/minhas-comunidades']);
      },
      error: async () => {
        this.salvando = false;   // <-- NOVO
        this.exibirMensagem('Erro ao criar comunidade.');
      }
    });
  }

  //já estou fazendo isso no backend, então não precisa mais dessa função.
  /*
  cadastrarCriadorNaComunidade(comunidade: ComunidadeModel) {
    const usuarioComunidade = new UsuarioComunidadeModel();
    usuarioComunidade.usuario = this.usuarioService.getUsuarioSessao();
    usuarioComunidade.comunidade = comunidade;

    this.usuarioComunidadeService
      .cadastrar(usuarioComunidade)
      .subscribe({
        next: async () => {
          this.exibirMensagem(
            'Comunidade criada com sucesso!'
          );

          this.router.navigate([
            '/minhas-comunidades'
          ]);
        },
        error: async () => {
          this.exibirMensagem(
            'Comunidade criada, mas houve erro ao vincular o criador.'
          );

          this.router.navigate([
            '/minhas-comunidades'
          ]);
        }
      });
  }
      */

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
