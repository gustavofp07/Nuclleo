import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonButton, IonIcon,
  IonHeader, IonToolbar, IonButtons, IonMenuButton,
  IonTitle, IonLabel, AlertController, ActionSheetController
} from '@ionic/angular/standalone';
import { CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import { chevronBackOutline, imageOutline, cameraOutline } from 'ionicons/icons';

import { UsuarioModel } from 'src/app/model/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ArquivoService } from 'src/app/services/arquivo.service';
import { NgxMaskDirective } from 'ngx-mask';
import { TokenService } from 'src/app/services/token.service';
import { TokenModel } from 'src/app/model/token.model';

@Component({
  selector: 'app-usuario-alterar',
  templateUrl: './usuario-alterar.page.html',
  styleUrls: ['./usuario-alterar.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    ReactiveFormsModule,
    IonButton,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    NgxMaskDirective
  ]
})
export class UsuarioAlterarPage implements OnInit {
  token?: TokenModel;

  usuario: UsuarioModel;
  formUsuario: FormGroup;
  previewFoto: string | ArrayBuffer | null = null;
  imagemSelecionada?: File;

  verificandoEmail: boolean = false;
  salvando: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private usuarioService: UsuarioService,
    private alertController: AlertController,
    private arquivoService: ArquivoService,
    private actionSheetController: ActionSheetController,
    private tokenService: TokenService,
  ) {
    addIcons({
      chevronBackOutline,
      imageOutline,
      cameraOutline
    });

    this.usuario = new UsuarioModel();

    this.formUsuario = this.formBuilder.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)
      ]],

      nmUsuario: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/)
      ]],

      cpf: ['', [this.validarCpf]],

      cep: ['', [
        Validators.pattern(/^\d{8}$/)
      ]],

      telefone: ['', [
        Validators.pattern(/^\d{11}$/)
      ]]
    });
  }

  ngOnInit() {
    if (localStorage.getItem('usuarioAutenticado')) {
      const usuarioLogado: UsuarioModel = JSON.parse(
        localStorage.getItem('usuarioAutenticado') || ''
      );
      this.buscarUsuario(usuarioLogado.cdUsuario);
    } else {
      console.log('Não tem nenhum usuário autenticado no momento.');
    }
  }

  ionViewWillEnter() {
    const aux = this.tokenService.temToken();

    if (!aux) {
      this.router.navigate(['/login']);
      return;
    }

    this.token = this.tokenService.extrair();
    this.buscarUsuario(this.token.cdUsuario);
  }

  private buscarUsuario(cdUsuario: number) {
    this.usuarioService.buscarUsuario(cdUsuario).subscribe({
      next: (usuario: UsuarioModel) => {
        console.log('busquei ', usuario);
        this.usuario = usuario;
        this.previewFoto = null;
        this.imagemSelecionada = undefined;

        this.formUsuario.patchValue({
          email: usuario.email,
          nmUsuario: usuario.nmUsuario,
          cpf: usuario.cpf || '',
          cep: usuario.cep || '',
          telefone: usuario.telefone || ''
        });
      },
      error: () => {
        console.log('Erro ao buscar usuário');
      }
    });
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

    this.usuarioService.verificarEmail(email, this.usuario.cdUsuario).subscribe({
      next: (existe: boolean) => {
        if (existe) {
          campoEmail.setErrors({
            ...(campoEmail.errors || {}),
            emailExistente: true
          });
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

  async confirmarAlteracoes() {
    if (this.salvando) {
      return;
    }

    if (this.verificandoEmail) {
      await this.exibirMensagem('Aguarde a verificação do e-mail.');
      return;
    }

    if (this.formUsuario.invalid) {
      this.formUsuario.markAllAsTouched();
      await this.exibirMensagem('Preencha os campos corretamente.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar Alterações',
      message: 'Deseja realmente salvar as alterações?',
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

  salvarAlteracoes() {
    if (this.salvando) {
      return;
    }

    this.salvando = true;

    this.usuario.email = this.formUsuario.value.email;
    this.usuario.nmUsuario = this.formUsuario.value.nmUsuario;

    this.usuario.cpf = this.formUsuario.value.cpf
      ? this.formUsuario.value.cpf.replace(/\D/g, '')
      : '';

    this.usuario.cep = this.formUsuario.value.cep
      ? this.formUsuario.value.cep.replace(/\D/g, '')
      : '';

    this.usuario.telefone = this.formUsuario.value.telefone
      ? this.formUsuario.value.telefone.replace(/\D/g, '')
      : '';

    this.usuarioService.atualizar(this.usuario, this.imagemSelecionada).subscribe({
      next: (usuario: UsuarioModel) => {
        //logar o usuário atualizado na sessão
        this.exibirMensagem('Alterações salvas com sucesso!');
        this.salvando = false;
        this.router.navigate(['/login']);
      },
      error: async (erro: any) => {
        this.salvando = false;
        const mensagem =
          erro.error?.message ||
          (typeof erro.error === 'string' ? erro.error : '') ||
          erro.message ||
          'Erro ao atualizar usuário.';

        console.error('Erro! ', mensagem, erro);
        await this.exibirMensagem(mensagem);
      }
    });
  }

  async abrirAlterarSenha() {
    const alert = await this.alertController.create({
      header: 'Alterar senha',
      message: 'Informe a senha atual e a nova senha para confirmar a alteração.',
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
            if (!dados.senhaAtual) {
              await this.exibirMensagem('Informe a senha atual.');
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

            this.salvarSenha(dados.senhaAtual, dados.novaSenha);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }



  salvarSenha(senhaAtual: string, novaSenha: string) {
    console.log("Erro aqui.");
    //criar um EndPoint passando a senha velha e a nova para atualizar.

    /*
    this.usuarioService.atualizar(this.usuario, this.imagemSelecionada).subscribe({
      next: async (usuario: UsuarioModel) => {
        console.log('senha atualizada ', usuario);
        this.usuarioService.salvarUsuarioSessao(usuario);
        this.usuario = usuario;
        this.senhaOriginal = usuario.senha;
        await this.exibirMensagem('Senha alterada com sucesso!');
        this.router.navigate(['/usuario-perfil']);
      },
      error: async (erro: any) => {
        const mensagem =
          erro.error?.message ||
          (typeof erro.error === 'string' ? erro.error : '') ||
          erro.message ||
          'Erro ao atualizar senha.';

        console.error('Erro! ', mensagem, erro);
        await this.exibirMensagem(mensagem);
      }
    });
    */
  }


  validarCpf(control: AbstractControl): ValidationErrors | null {
    const valor = control.value;

    // CPF não é obrigatório
    if (!valor) {
      return null;
    }

    const cpf = String(valor).replace(/\D/g, '');

    // Se começou a preencher, precisa ter exatamente 11 números
    if (cpf.length !== 11) {
      return { cpfIncompleto: true };
    }

    // Elimina CPFs formados pelo mesmo número
    if (/^(\d)\1{10}$/.test(cpf)) {
      return { cpfInvalido: true };
    }

    // Primeiro dígito verificador
    let soma = 0;

    for (let i = 0; i < 9; i++) {
      soma += Number(cpf.charAt(i)) * (10 - i);
    }

    let digito1 = 11 - (soma % 11);

    if (digito1 >= 10) {
      digito1 = 0;
    }

    if (digito1 !== Number(cpf.charAt(9))) {
      return { cpfInvalido: true };
    }

    // Segundo dígito verificador
    soma = 0;

    for (let i = 0; i < 10; i++) {
      soma += Number(cpf.charAt(i)) * (11 - i);
    }

    let digito2 = 11 - (soma % 11);

    if (digito2 >= 10) {
      digito2 = 0;
    }

    if (digito2 !== Number(cpf.charAt(10))) {
      return { cpfInvalido: true };
    }

    return null;
  }

  async exibirMensagem(mensagem: string) {
    const alert = await this.alertController.create({
      header: 'Aviso',
      message: mensagem,
      buttons: ['OK']
    });

    await alert.present();
  }

  cancelar() {
    this.router.navigate(['/usuario-perfil']);
  }
}