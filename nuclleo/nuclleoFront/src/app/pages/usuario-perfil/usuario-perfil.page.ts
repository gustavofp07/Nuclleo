import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonMenuButton, IonButtons, IonHeader, IonToolbar, IonTitle, IonButton, IonList, IonIcon, IonLabel, IonMenu } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { home, peopleOutline, chatbubbleOutline, personOutline, createOutline, locationOutline, calendarOutline, checkmarkCircleOutline } from 'ionicons/icons';

import { UsuarioModel } from 'src/app/model/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';

import { Router, RouterLink } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { AnuncioModel } from 'src/app/model/anuncio.model';
import { AnuncioService } from 'src/app/services/anuncio.service';

import { UsuarioComunidadeService } from 'src/app/services/usuario-comunidade.service';

@Component({
  selector: 'app-usuario-perfil',
  templateUrl: './usuario-perfil.page.html',
  styleUrls: ['./usuario-perfil.page.scss'],
  standalone: true,
  imports: [IonContent, IonMenuButton, IonButtons, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonMenu, IonList, IonLabel, CommonModule, FormsModule, RouterLink]
})
export class UsuarioPerfilPage implements OnInit {

  usuario: UsuarioModel;
  anuncios: AnuncioModel[] = [];

  constructor(private usuarioService: UsuarioService,
    private router: Router,
    private toastController: ToastController,
    private anuncioService: AnuncioService,
    private usuarioComunidadeService: UsuarioComunidadeService,
  ) {

    addIcons({
      home,
      peopleOutline,
      chatbubbleOutline,
      personOutline,
      createOutline,
      locationOutline,
      calendarOutline,
      checkmarkCircleOutline
    });

    this.usuario = new UsuarioModel();
  }

  ngOnInit() { }

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
          //console.log("busquei ", usuario);
          this.usuario = usuario;
          this.carregarAnunciosUsuario();
        },
        error: async () => {
          //console.error('Erro ao logar');
          console.log('Erro ao buscar usuário.');
        }
      });
    }
  }

  excluir() {
    const usuarioLogado: UsuarioModel =
      this.usuarioService.getUsuarioSessao();

    this.usuarioComunidadeService
      .excluirPorUsuario(usuarioLogado.cdUsuario)
      .subscribe({
        next: () => {

          this.usuarioService
            .excluirUsuario(usuarioLogado.cdUsuario)
            .subscribe({
              next: () => {
                this.usuarioService.limparSessao();
                this.router.navigate(['/login']);
              },
              error: () => {
                this.exibirMensagem('Erro ao excluir o usuário.');
              }
            });

        },
        error: () => {
          this.exibirMensagem('Erro ao remover usuário das comunidades.');
        }
      });
  }

  carregarAnunciosUsuario() {
    this.anuncioService
      .listarAnunciosPorUsuario(this.usuario.cdUsuario)
      .subscribe({
        next: (dados) => {
          this.anuncios = dados;
        },
        error: () => {
          console.error('Erro ao carregar anúncios do usuário.');
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