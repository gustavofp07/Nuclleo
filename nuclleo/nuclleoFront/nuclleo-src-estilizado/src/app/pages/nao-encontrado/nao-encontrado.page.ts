import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  IonContent,
  IonIcon,
  IonButton
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { compassOutline } from 'ionicons/icons';

@Component({
  selector: 'app-nao-encontrado',
  templateUrl: './nao-encontrado.page.html',
  styleUrls: ['./nao-encontrado.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonIcon,
    IonButton
  ]
})
export class NaoEncontradoPage {
  constructor() {
    addIcons({ compassOutline });
  }
}