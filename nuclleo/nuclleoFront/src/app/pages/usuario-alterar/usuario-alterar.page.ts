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
  AlertController
} from '@ionic/angular/standalone';

import { Router } from '@angular/router';

import { addIcons } from 'ionicons';

import {
  chevronBackOutline,
  eyeOffOutline,
  eyeOutline,
  imageOutline
} from 'ionicons/icons';

import { UsuarioModel } from 'src/app/model/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-usuario-alterar',
  templateUrl: './usuario-alterar.page.html',
  styleUrls: ['./usuario-alterar.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonItem, IonInput, IonButton, IonIcon, IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonLabel]
})
export class UsuarioAlterarPage implements OnInit {
  usuario: UsuarioModel;

  previewFoto: string | ArrayBuffer | null = null;
  showPassword: boolean = false;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private alertController: AlertController
  ) {

    addIcons({
      chevronBackOutline,
      eyeOutline,
      eyeOffOutline,
      imageOutline
    });

    this.usuario = new UsuarioModel();

  }

  ngOnInit() {
    if (localStorage.getItem("usuarioAutenticado")) {

      let usuarioLogado: UsuarioModel = JSON.parse(localStorage.getItem("usuarioAutenticado") || "");

      this.usuarioService.buscarUsuario(usuarioLogado.cdUsuario).subscribe({
        next: async (usuario: UsuarioModel) => {
          console.log("busquei ", usuario);
          this.usuario = usuario;
        },
        error: async () => {
          //console.error('Erro ao logar');
          console.log('Erro ao logar');
        }
      });

    } else {
      console.log("Não tem nenhum usuário autenticado no momento.");
    }
  }

  ionViewWillEnter() {
    let aux = this.usuarioService.verificarSessao();
    if (aux == false) {
      //this.exibirMensagem("Não há usuário logado.");
      this.router.navigate(['/login']);
    } else {
      //existe alguém logado
      let usuarioLogado: UsuarioModel = this.usuarioService.getUsuarioSessao();

      this.usuarioService.buscarUsuario(usuarioLogado.cdUsuario).subscribe({
        next: async (usuario: UsuarioModel) => {
          console.log("busquei ", usuario);
          this.usuario = usuario;
        },
        error: async () => {
          //console.error('Erro ao logar');
          console.log('Erro ao logar');
        }
      });

    }

  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  selecionarImagem(event: any) {

    const arquivo = event.target.files[0];

    if (arquivo) {

      const reader = new FileReader();

      reader.onload = () => {
        this.previewFoto = reader.result;
      };

      reader.readAsDataURL(arquivo);
    }
  }

  salvarAlteracoes() {
    //console.log(this.usuario);
    this.usuarioService.atualizar(this.usuario).subscribe({
      next: async (usuario: UsuarioModel) => {
        console.log("atualizou ", usuario);
        //mudar a lógica para atualizar o usuário na sessão
        this.router.navigate(['/login']);
      },
      error: async (erro) => {
        console.error('Erro! ', erro.error?.message);
      }
    });
  }

  async confirmarAlteracoes() {
    const alert = await this.alertController.create({
        header: 'Confirmar Alterações',
        message: 'Deseja realmente salvar as alterações?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Excluir',
            role: 'destructive',
            handler: () => {
              this.salvarAlteracoes();
            }
          }
        ]
      });

    await alert.present();
  }

  cancelar() {
    this.router.navigate(['/usuario-perfil']);
  }

  teste() {

  }

}