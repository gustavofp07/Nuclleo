import { Component, OnInit } from '@angular/core';
import {
  IonContent, IonLabel, IonAvatar, IonItem, IonCardSubtitle, IonCardTitle, IonCard, IonCardHeader,
  IonList, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonMenuButton, IonButtons, IonIcon, IonMenu, IonButton,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-minhas-comunidades',
  templateUrl: './minhas-comunidades.page.html',
  styleUrls: ['./minhas-comunidades.page.scss'],
  standalone: true,
  imports: [RouterLink, IonContent, IonLabel, IonAvatar, IonItem, IonCardSubtitle, IonCardTitle, IonCard, IonCardHeader,
    IonList, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonMenuButton, IonButtons, IonIcon, IonMenu, IonButton]
})

export class MinhasComunidadesPage
implements OnInit {

  comunidades: any[] = [];

  ngOnInit() {

    this.carregarComunidades();

  }

  ionViewWillEnter() {

    this.carregarComunidades();

  }

  carregarComunidades() {

    this.comunidades =
      JSON.parse(
        localStorage.getItem('comunidades') || '[]'
      );

  }

}