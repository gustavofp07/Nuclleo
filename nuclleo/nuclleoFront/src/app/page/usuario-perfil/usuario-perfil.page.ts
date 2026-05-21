import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';

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
  imports: [IonContent, IonButton, IonIcon, CommonModule, FormsModule, RouterLink]
})
export class UsuarioPerfilPage implements OnInit {

  usuario: UsuarioModel;

  constructor(private usuarioService: UsuarioService,
              private router : Router
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

  ngOnInit() {
    if (localStorage.getItem("usuarioAutenticado")) {

      let usuarioLogado: UsuarioModel = JSON.parse(localStorage.getItem("usuarioAutenticado") || "");

      this.usuarioService.buscarUsuario(usuarioLogado.cdUsuario).subscribe({
        next: async (usuario: UsuarioModel) => {
          console.log("busquei ", usuario);
          this.usuario = usuario;
        },
        error: async () => {
          console.error('Erro ao logar');
        }
      });

    } else {
      console.log("Não tem nenhum usuário autenticado no momento.");
    }



    /*
    // EXEMPLO
    this.usuario.nmUsuario = 'Gustavo Fusca';
    this.usuario.email = 'gpedrosa@gmail.com';
    this.usuario.cpf = '123.456.789-00';
    this.usuario.telefone = '+55 (31) 94002-8922';
*/
  }

}