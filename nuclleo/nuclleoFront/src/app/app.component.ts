// app.component.ts

import { Component } from '@angular/core';

import {
  Router,
  RouterLink,
  NavigationEnd
} from '@angular/router';

import { filter } from 'rxjs/operators';

import {
  IonApp,
  IonRouterOutlet,
  IonToolbar,
  IonContent,
  IonLabel,
  IonItem,
  IonList,
  IonHeader,
  IonTitle,
  IonIcon,
  IonMenu
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  personOutline,
  homeOutline,
  logOutOutline,
  peopleOutline
} from 'ionicons/icons';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  styleUrls: ['app.component.scss'],

  imports: [
    RouterLink,

    IonApp,
    IonRouterOutlet,
    IonToolbar,
    IonContent,
    IonLabel,
    IonItem,
    IonList,
    IonHeader,
    IonTitle,
    IonIcon,
    IonMenu
  ],
})

export class AppComponent {

  menuHabilitado = true;

  constructor(private router: Router) {

    addIcons({
      personOutline,
      homeOutline,
      logOutOutline,
      peopleOutline
    });

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {

        const rotaAtual = this.router.url;

        this.menuHabilitado =
          rotaAtual !== '/login' &&
          rotaAtual !== '/cadastro';

      });

  }

}