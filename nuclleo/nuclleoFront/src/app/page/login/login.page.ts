import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonInput,
  IonItem,
  IonIcon } from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, RouterLink, IonButton, IonInput, IonItem, IonIcon, IonHeader, IonToolbar]
})
export class LoginPage implements OnInit {

  email = signal('');
  password = signal('');
  showPassword = signal(false);

  onSubmit() {
    console.log('Login');
  }

  onGoogleLogin() {
    console.log('Google Login');
  }

  constructor() { }

  ngOnInit() {
  }
  
}