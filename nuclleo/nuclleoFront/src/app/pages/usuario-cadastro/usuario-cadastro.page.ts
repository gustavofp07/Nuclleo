// usuario-cadastro.page.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import {
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  ToastController,
  IonAvatar,
  LoadingController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  eyeOutline,
  eyeOffOutline
} from 'ionicons/icons';

import { UsuarioModel } from 'src/app/model/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ArquivoService } from 'src/app/services/arquivo.service';


@Component({
  selector: 'app-usuario-cadastro',
  templateUrl: './usuario-cadastro.page.html',
  styleUrls: ['./usuario-cadastro.page.scss'],
  standalone: true,

  imports: [
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    FormsModule,
    CommonModule,
    IonAvatar
  ]
})

export class UsuarioCadastroPage implements OnInit {

  usuario: UsuarioModel;
  confirmarSenha: string = '';
  showPassword: boolean = false;

  previewFoto: string | ArrayBuffer | null = null;
  showConfirmPassword: boolean = false;

  imagemSelecionada?: File;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private usuarioService: UsuarioService,
    private loadingController: LoadingController,
    private arquivoService: ArquivoService
  ) {

    this.usuario = new UsuarioModel();

    addIcons({
      eyeOutline,
      eyeOffOutline
    });

  }

  ngOnInit() { }

  ionViewWillEnter() {
    this.usuario = new UsuarioModel();
    this.confirmarSenha = "";
    this.showPassword = false;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword =
      !this.showConfirmPassword;
  }

  async salvar() {

    if (
      !this.usuario.email ||
      !this.usuario.nmUsuario ||
      !this.usuario.senha
    ) {

      this.exibirMensagem(
        'Preencha todos os campos!'
      );
      return;
    }

    if (this.usuario.senha !== this.confirmarSenha) {

      this.exibirMensagem(
        'As senhas não coincidem!'
      );
      return;
    }

    this.usuarioService.cadastrarUsuario(this.usuario, this.imagemSelecionada
      ).subscribe({

        next: async () => {
          console.log("Sucesso");
          await this.exibirMensagem(
            'Cadastro realizado com sucesso!'
          );

          this.router.navigate(['/login']);
        },
        error: async (err) => {
          console.log("Erro");
          console.error(err);
          await this.exibirMensagem(
            'Erro ao cadastrar usuário!'
          );
        }
      });

  }


  async selecionarImagem() {
    
    const arquivo = await this.arquivoService.capturar();
    console.log("Selecionar imagem");

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


  async exibirMensagem(texto: string) {
    const toast =
      await this.toastController.create({

        message: texto,
        duration: 2000

      });
    toast.present();
  }
}