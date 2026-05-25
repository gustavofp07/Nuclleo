import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonMenuButton, IonButtons, IonHeader, IonToolbar, IonTitle, IonButton, IonList, IonIcon, IonLabel, IonMenu } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { home, peopleOutline, chatbubbleOutline, personOutline, createOutline, locationOutline, calendarOutline, checkmarkCircleOutline } from 'ionicons/icons';

import { UsuarioModel } from 'src/app/model/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';

import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-usuario-perfil',
  templateUrl: './usuario-perfil.page.html',
  styleUrls: ['./usuario-perfil.page.scss'],
  standalone: true,
  imports: [IonContent, IonMenuButton, IonButtons, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonMenu, IonList, IonLabel, CommonModule, FormsModule, RouterLink]
})
export class UsuarioPerfilPage implements OnInit {

  usuario: UsuarioModel;

  constructor(private usuarioService: UsuarioService,
    private router: Router
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
        },
        error: async () => {
          //console.error('Erro ao logar');
          console.log('Erro ao buscar usuário.');
        }
      });
    }
  }

  excluir() {
    let usuarioLogado: UsuarioModel = this.usuarioService.getUsuarioSessao();

    //let teste = this.usuarioService.excluirUsuario(usuarioLogado.cdUsuario);

    this.usuarioService.excluirUsuario(usuarioLogado.cdUsuario).subscribe({
      next: async (usuario: UsuarioModel) => {
        console.log("excluiu", usuario);
        this.router.navigate(['/login']);
      },
      error: async () => {
        //console.error('Erro ao logar');
        console.log('Erro ao excluir o usuário.');
      }
    });

  }

}