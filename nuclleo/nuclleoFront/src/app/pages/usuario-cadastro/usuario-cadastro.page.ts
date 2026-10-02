import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

import { Router } from '@angular/router';

import {
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  ToastController,
  LoadingController,
  ActionSheetController
} from '@ionic/angular/standalone';

import { CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import {
  eyeOutline,
  eyeOffOutline,
  cameraOutline,
  imageOutline
} from 'ionicons/icons';

import { UsuarioService } from 'src/app/services/usuario.service';
import { ArquivoService } from 'src/app/services/arquivo.service';
import { UsuarioCadastroDTOModel } from 'src/app/model/usuario-cadastro-dto.model';


@Component({
  selector: 'app-usuario-cadastro',
  templateUrl: './usuario-cadastro.page.html',
  styleUrls: ['./usuario-cadastro.page.scss'],
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,

    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon
  ]
})

export class UsuarioCadastroPage implements OnInit {
  formUsuario: FormGroup;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  previewFoto: string | ArrayBuffer | null = null;
  imagemSelecionada?: File;
  verificandoEmail: boolean = false;
  salvando: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private usuarioService: UsuarioService,
    private loadingController: LoadingController,
    private arquivoService: ArquivoService,
    private actionSheetController: ActionSheetController
  ) {
    addIcons({
      eyeOutline,
      eyeOffOutline,
      cameraOutline,
      imageOutline
    });

    this.formUsuario = this.formBuilder.group(
      {
        email: ['', Validators.compose([
          Validators.required,
          Validators.email,
          Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)
        ])],
        nmUsuario: ['', Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/)
        ])],
        senha: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
        confirmarSenha: ['', Validators.required]
      },
      {
        validators: this.validarSenhas
      }
    );
  }

  ngOnInit() { }

  ionViewWillEnter() {
    this.previewFoto = null;
    this.imagemSelecionada = undefined;
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.verificandoEmail = false;
    this.salvando = false;

    this.formUsuario.reset({
      email: '',
      nmUsuario: '',
      senha: '',
      confirmarSenha: ''
    });
  }

  validarSenhas(control: AbstractControl): ValidationErrors | null {
    const senha = control.get('senha')?.value;
    const confirmarSenha = control.get('confirmarSenha')?.value;

    if (!senha || !confirmarSenha) {
      return null;
    }

    if (senha !== confirmarSenha) {
      return { senhasDiferentes: true };
    }

    return null;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  verificarEmail() {
    const campoEmail = this.formUsuario.get('email');

    if (!campoEmail) {
      return;
    }

    if (
      campoEmail.hasError('required') ||
      campoEmail.hasError('email') ||
      campoEmail.hasError('pattern')
    ) {
      return;
    }

    const email = campoEmail.value;

    if (!email) {
      return;
    }

    this.verificandoEmail = true;

    this.usuarioService.verificarEmail(email, null).subscribe({
      next: (existe: boolean) => {
        if (existe) {
          campoEmail.setErrors({ ...(campoEmail.errors || {}), emailExistente: true });
        } else {
          this.removerErroEmailExistente(campoEmail);
        }
        this.verificandoEmail = false;
      },
      error: (erro: any) => {
        console.error('Erro ao verificar e-mail: ', erro);
        this.verificandoEmail = false;
        this.exibirMensagem(erro.error?.message || 'Erro ao verificar e-mail.');
      }
    });
  }

  removerErroEmailExistente(campoEmail: AbstractControl) {
    if (!campoEmail.errors?.['emailExistente']) {
      return;
    }

    const erros = { ...campoEmail.errors };
    delete erros['emailExistente'];

    campoEmail.setErrors(Object.keys(erros).length > 0 ? erros : null);
  }

  salvar() {
    if (this.salvando) {
      return;
    }

    if (this.verificandoEmail) {
      this.exibirMensagem('Aguarde a verificação do e-mail.');
      return;
    }

    if (this.formUsuario.invalid) {
      this.formUsuario.markAllAsTouched();
      this.exibirMensagem('Preencha os campos corretamente.');
      return;
    }

    this.salvando = true;

    const usuario = new UsuarioCadastroDTOModel();
    usuario.email = this.formUsuario.value.email;
    usuario.nmUsuario = this.formUsuario.value.nmUsuario;
    usuario.senha = this.formUsuario.value.senha;

    this.usuarioService.cadastrarUsuario(usuario, this.imagemSelecionada).subscribe({
      next: async () => {
        await this.exibirMensagem('Cadastro realizado com sucesso!');
        this.router.navigate(['/login']);
      },
      error: async (erro: any) => {
        this.salvando = false;
        console.error('Erro ao cadastrar usuário: ', erro);
        await this.exibirMensagem(erro.error?.message || 'Erro ao cadastrar usuário!');
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

    const tiposPermitidos = ['image/jpeg', 'image/png'];

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

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 2000,
      position: 'top'
    });

    await toast.present();
  }
}