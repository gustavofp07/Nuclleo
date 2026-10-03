import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import {
  IonContent,
  IonButton,
  ToastController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  ActionSheetController
} from '@ionic/angular/standalone';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CommonModule } from '@angular/common';

import { ComunidadeModel } from 'src/app/model/comunidade.model';
import { ComunidadeCadastroDTOModel } from 'src/app/model/comunidade-cadastro-dto.model';

import { ComunidadeService } from 'src/app/services/comunidade.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ArquivoService } from 'src/app/services/arquivo.service';

import { CameraSource } from '@capacitor/camera';

import { addIcons } from 'ionicons';
import {
  cameraOutline,
  imageOutline
} from 'ionicons/icons';

import { NgxMaskDirective } from 'ngx-mask';


@Component({
  selector: 'app-criar-comunidade',
  templateUrl: './criar-comunidade.page.html',
  styleUrls: ['./criar-comunidade.page.scss'],
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,

    IonContent,
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,

    NgxMaskDirective
  ]
})

export class CriarComunidadePage {

  formComunidade: FormGroup;

  modoEdicao: boolean = false;
  salvando: boolean = false;

  comunidade?: ComunidadeModel;

  fotoAtual: string = '';

  previewFoto: string | ArrayBuffer | null = null;
  imagemSelecionada?: File;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private activatedRoute: ActivatedRoute,
    private comunidadeService: ComunidadeService,
    private usuarioService: UsuarioService,
    private arquivoService: ArquivoService,
    private actionSheetController: ActionSheetController
  ) {

    addIcons({
      cameraOutline,
      imageOutline
    });

    this.formComunidade = this.formBuilder.group({

      nmComunidade: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],

      descricao: ['', [
        Validators.required,
        Validators.minLength(3)
      ]],

      cep: ['', [
        Validators.required,
        Validators.pattern(/^\d{8}$/)
      ]]

    });
  }


  ngOnInit() {
  }


  ionViewWillEnter() {

    this.modoEdicao = false;

    this.comunidade = undefined;

    this.previewFoto = null;
    this.imagemSelecionada = undefined;
    this.fotoAtual = '';

    this.salvando = false;

    this.formComunidade.reset({
      nmComunidade: '',
      descricao: '',
      cep: ''
    });

    const cdComunidade =
      this.activatedRoute.snapshot.paramMap.get('cdComunidade');

    if (cdComunidade) {

      this.modoEdicao = true;

      this.carregarComunidade(
        Number(cdComunidade)
      );

    }

  }


  carregarComunidade(cdComunidade: number) {

    this.comunidadeService
      .buscarComunidade(cdComunidade)
      .subscribe({

        next: (comunidade: ComunidadeModel) => {

          this.comunidade = comunidade;

          this.fotoAtual =
            comunidade.foto || '';

          this.formComunidade.patchValue({

            nmComunidade:
              comunidade.nmComunidade,

            descricao:
              comunidade.descricao,

            cep:
              comunidade.cep || ''

          });

        },

        error: (error: any) => {

          console.error(
            'Erro ao carregar comunidade:',
            error
          );

          this.exibirMensagem(
            'Erro ao carregar comunidade.'
          );

        }

      });

  }


  async selecionarImagem() {

    const actionSheet =
      await this.actionSheetController.create({

        header: 'Foto',

        buttons: [

          {
            text: 'Câmera',
            icon: 'camera-outline',
            handler: () =>
              this.capturarImagem(
                CameraSource.Camera
              )
          },

          {
            text: 'Galeria',
            icon: 'image-outline',
            handler: () =>
              this.capturarImagem(
                CameraSource.Photos
              )
          },

          {
            text: 'Cancelar',
            role: 'cancel'
          }

        ]

      });

    await actionSheet.present();

  }


  private async capturarImagem(
    source: CameraSource
  ) {

    const arquivo =
      await this.arquivoService.capturar(source);

    if (!arquivo) {
      return;
    }

    if (
      arquivo.type !== 'image/png' &&
      arquivo.type !== 'image/jpeg'
    ) {

      this.exibirMensagem(
        'Selecione apenas imagens PNG ou JPG.'
      );

      return;
    }

    this.imagemSelecionada = arquivo;

    const reader = new FileReader();

    reader.onload = () => {

      this.previewFoto =
        reader.result;

    };

    reader.readAsDataURL(arquivo);

  }


  salvarComunidade() {

    if (this.salvando) {
      return;
    }

    if (this.formComunidade.invalid) {

      this.formComunidade.markAllAsTouched();

      this.exibirMensagem(
        'Preencha os campos corretamente.'
      );

      return;
    }

    this.salvando = true;

    if (this.modoEdicao) {

      this.atualizarComunidade();

    } else {

      this.cadastrarComunidade();

    }

  }


  cadastrarComunidade() {

    const comunidadeCadastro =
      new ComunidadeCadastroDTOModel();

    comunidadeCadastro.nmComunidade =
      this.formComunidade.value.nmComunidade;

    comunidadeCadastro.descricao =
      this.formComunidade.value.descricao;

    comunidadeCadastro.cep =
      this.formComunidade.value.cep
        .replace(/\D/g, '');

    comunidadeCadastro.cdUsuarioCria =
      this.usuarioService
        .getUsuarioSessao()
        .cdUsuario;

    this.comunidadeService
      .cadastrarComunidade(
        comunidadeCadastro,
        this.imagemSelecionada
      )
      .subscribe({

        next: () => {

          this.exibirMensagem(
            'Comunidade criada com sucesso!'
          );

          this.router.navigate([
            '/minhas-comunidades'
          ]);

        },

        error: (error: any) => {

          this.salvando = false;

          console.error(
            'Erro ao criar comunidade:',
            error
          );

          this.exibirMensagem(
            'Erro ao criar comunidade.'
          );

        }

      });

  }


  atualizarComunidade() {
    if (!this.comunidade) {
      this.salvando = false;
      this.exibirMensagem('Comunidade não encontrada.');
      return;
    }

    this.comunidade.nmComunidade = this.formComunidade.value.nmComunidade;

    this.comunidade.descricao = this.formComunidade.value.descricao;

    this.comunidade.cep = this.formComunidade.value.cep.replace(/\D/g, '');

    this.comunidadeService
      .atualizarComunidade(
        this.comunidade,
        this.imagemSelecionada
      )
      .subscribe({
        next: () => {

          this.exibirMensagem(
            'Comunidade atualizada com sucesso!'
          );

          this.router.navigate([
            '/minhas-comunidades'
          ]);
        },
        error: (error: any) => {
          this.salvando = false;
          console.error(
            'Erro ao atualizar comunidade:',
            error
          );
          this.exibirMensagem(
            'Erro ao atualizar comunidade.'
          );
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