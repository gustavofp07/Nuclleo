import {
  Component,
  OnInit
} from '@angular/core';

import {
  IonContent,
  IonLabel,
  IonAvatar,
  IonItem,
  IonCardSubtitle,
  IonCardTitle,
  IonCard,
  IonCardHeader,
  IonList,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonMenuButton,
  IonButtons,
  IonIcon,
  IonMenu,
  IonButton
} from '@ionic/angular/standalone';

import {
  CommonModule
} from '@angular/common';

import {
  RouterLink
} from '@angular/router';

import {
  HttpClient
} from '@angular/common/http';

@Component({
  selector: 'app-minhas-comunidades',
  templateUrl: './minhas-comunidades.page.html',
  styleUrls: ['./minhas-comunidades.page.scss'],
  standalone: true,

  imports: [
    CommonModule,

    RouterLink,

    IonContent,
    IonLabel,
    IonAvatar,
    IonItem,
    IonCardSubtitle,
    IonCardTitle,
    IonCard,
    IonCardHeader,
    IonList,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSearchbar,
    IonMenuButton,
    IonButtons,
    IonIcon,
    IonMenu,
    IonButton
  ]
})

export class MinhasComunidadesPage
implements OnInit {

  comunidades: any[] = [];

  constructor(
    private http: HttpClient
  ) { }

  ngOnInit() {

    this.carregarComunidades();

  }

  ionViewWillEnter() {

    this.carregarComunidades();

  }

  carregarComunidades() {

  const usuarioLogado =
    JSON.parse(
      localStorage.getItem(
        'usuarioAutenticado'
      ) || '{}'
    );

  this.http.get<any[]>(

    'http://localhost:8080/api/v1/comunidades/usuario/' +
    usuarioLogado.cdUsuario

  ).subscribe({

    next: (dados) => {

      this.comunidades = dados;

    },

    error: (erro) => {

      console.log(erro);

    }

  });

}

}