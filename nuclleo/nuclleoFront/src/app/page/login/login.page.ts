import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

import {
  eyeOutline,
  eyeOffOutline
} from 'ionicons/icons';

import { LoginModel } from 'src/app/model/login.model';
import { LoginService } from 'src/app/services/login.service';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,

    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon
  ]
})

export class LoginPage implements OnInit {
  login: LoginModel;
  showPassword: boolean = false;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private loginService: LoginService,
    private usuarioService: UsuarioService
  ) {

    this.login = new LoginModel();

    addIcons({
      eyeOutline,
      eyeOffOutline
    });
  }

  ngOnInit() {
    this.usuarioService.limparSessao();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  entrar() {
    //console.log('Login');
    //console.log(this.login.email);
    //console.log(this.login.senha);

    this.loginService.entrar(this.login).subscribe({
      next: async (usuario: UsuarioModel) => {
        await this.exibirMensagem('Login realizado com sucesso!');
        //console.log(usuario);
        this.usuarioService.salvarUsuarioSessao(usuario);
        //localStorage.setItem("usuarioAutenticado",JSON.stringify(usuario));

        this.router.navigate(['/tela-inicial']);
      },
      error: async () => {
        await this.exibirMensagem('Erro ao logar!');
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