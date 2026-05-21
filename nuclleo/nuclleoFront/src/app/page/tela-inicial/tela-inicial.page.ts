import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonLabel, IonAvatar, IonItem, IonCardSubtitle, IonCardTitle, IonCard, IonCardHeader, 
  IonList, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonMenuButton, IonButtons, IonIcon, IonMenu } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tela-inicial',
  templateUrl: './tela-inicial.page.html',
  styleUrls: ['./tela-inicial.page.scss'],
  standalone: true,
  imports: [IonContent, RouterLink, IonLabel,IonAvatar, IonItem, IonCardSubtitle, IonCardTitle, IonCard, IonCardHeader, 
    IonList, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonMenuButton, IonButtons, IonIcon, IonMenu, CommonModule, FormsModule]
})
export class TelaInicialPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
