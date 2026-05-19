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
  imports: [CommonModule,
    FormsModule,
    RouterLink,

    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon]
})
export class LoginPage implements OnInit {

  email: string = '';
  password: string = '';

  showPassword: boolean = false;

  constructor() { }

  ngOnInit() { }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    console.log('Login');
    console.log(this.email);
    console.log(this.password);
  }

  onGoogleLogin() {
    console.log('Google Login');
  }
  
}