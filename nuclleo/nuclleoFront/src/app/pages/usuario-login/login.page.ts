import { Component, OnInit } from '@angular/core';
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
  IonItem,
  IonIcon,
  ToastController
} from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';

import { LoginModel } from 'src/app/model/login.model';
import { LoginService } from 'src/app/services/login.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon
  ]
})
export class LoginPage implements OnInit {
  formLogin: FormGroup;
  login: LoginModel;
  showPassword: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private loginService: LoginService,
    private usuarioService: UsuarioService,
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

  ngOnInit() {
    this.tokenService.excluir();
  }

  ionViewWillEnter() {
    this.tokenService.excluir();
    this.login = new LoginModel();
    this.showPassword = false;
    this.formLogin.reset({ email: '', senha: '' });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  entrar() {
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      return;
    }

    this.login.email = this.formLogin.value.email;
    this.login.senha = this.formLogin.value.senha;

    this.loginService.entrar(this.login).subscribe({
      next: async (token: string) => {
        this.tokenService.salvar(token);
        await this.exibirMensagem('Login realizado com sucesso!');
        this.router.navigate(['/tela-inicial']);
      },
      error: async (erro: any) => {
        console.error('Erro ao logar:', erro);
        await this.exibirMensagem('Erro! ' + erro?.error?.message);
      }
    });
  }

  onGoogleLogin() {
    console.log('Google Login');
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 2000
    });
    toast.present();
  }
}