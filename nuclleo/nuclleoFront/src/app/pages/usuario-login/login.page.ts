import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  IonContent,
  IonButton,
  IonInput,
  IonIcon,
  ToastController
} from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';

import { LoginModel } from 'src/app/model/login.model';
import { LoginService } from 'src/app/services/login.service';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonInput,
    IonButton,
    IonIcon
  ]
})
export class LoginPage {
  formLogin: FormGroup;
  login: LoginModel;
  showPassword: boolean = false;
  entrando: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private loginService: LoginService,
    private tokenService: TokenService
  ) {
    this.login = new LoginModel();

    this.formLogin = this.formBuilder.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)
      ]],
      senha: ['', Validators.required]
    });

    addIcons({ eyeOutline, eyeOffOutline });
  }

  ionViewWillEnter() {
    this.tokenService.excluir();
    this.login = new LoginModel();
    this.showPassword = false;
    this.entrando = false;
    this.formLogin.reset({ email: '', senha: '' });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  entrar() {
    if (this.entrando) {
      return;
    }

    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      return;
    }

    this.login.email = this.formLogin.value.email;
    this.login.senha = this.formLogin.value.senha;
    this.entrando = true;

    this.loginService.entrar(this.login).subscribe({
      next: async (token: string) => {
        this.tokenService.salvar(token);
        this.entrando = false;
        await this.exibirMensagem('Login realizado com sucesso!');
        this.router.navigate(['/tela-inicial']);
      },
      error: async (erro: any) => {
        this.entrando = false;
        console.error('Erro ao logar:', erro);
        await this.exibirMensagem(erro?.error?.message || 'Não foi possível entrar. Verifique seus dados.');
      }
    });
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
