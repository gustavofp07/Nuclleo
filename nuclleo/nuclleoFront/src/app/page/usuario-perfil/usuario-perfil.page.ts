import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { home, peopleOutline, chatbubbleOutline, personOutline, createOutline, locationOutline, calendarOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { UsuarioModel } from 'src/app/model/usuario.model';

@Component({
  selector: 'app-usuario-perfil',
  templateUrl: './usuario-perfil.page.html',
  styleUrls: ['./usuario-perfil.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, CommonModule, FormsModule]
})
export class UsuarioPerfilPage implements OnInit {

  usuario: UsuarioModel;

  constructor() {

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

    // EXEMPLO
    this.usuario.nmUsuario = 'Gustavo Fusca';
    this.usuario.email = 'gpedrosa@gmail.com';
    this.usuario.cpf = '123.456.789-00';
    this.usuario.telefone = '+55 (31) 94002-8922';

  }

}