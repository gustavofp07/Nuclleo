import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { IonContent, IonItem, IonInput, IonButton, ToastController } from '@ionic/angular/standalone';

import { UsuarioModel } from 'src/app/model/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';


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
    FormsModule,
    CommonModule
  ]
})
export class UsuarioCadastroPage implements OnInit {
  usuario: UsuarioModel;
  confirmarSenha: string = '';

  constructor(
    private router: Router,
    private toastController: ToastController,
    private usuarioService: UsuarioService
  ) {
    this.usuario = new UsuarioModel();
  }

  ngOnInit() { }

  async salvar() {

    if (!this.usuario.email || !this.usuario.nmUsuario || !this.usuario.senha) {
      this.exibirMensagem('Preencha todos os campos!');
      return;
    }

    if (this.usuario.senha !== this.confirmarSenha) {
      this.exibirMensagem('As senhas não coincidem!');
      return;
    }

    this.usuarioService.cadastrarUsuario(this.usuario).subscribe({
      next: async () => {
        await this.exibirMensagem('Cadastro realizado com sucesso!');
        this.router.navigate(['/login']);
      },
      error: async (err) => {
        console.error(err);
        await this.exibirMensagem('Erro ao cadastrar usuário!');
      }
    });
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 2000
    });
    toast.present();
  }
}


