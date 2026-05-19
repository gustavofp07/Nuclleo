import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./page/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'usuario-cadastro',
    loadComponent: () => import('./page/usuario-cadastro/usuario-cadastro.page').then( m => m.UsuarioCadastroPage)
  },
  {
    path: 'tela-inicial',
    loadComponent: () => import('./page/tela-inicial/tela-inicial.page').then( m => m.TelaInicialPage)
  },
  {
    path: 'usuario-perfil',
    loadComponent: () => import('./page/usuario-perfil/usuario-perfil.page').then( m => m.UsuarioPerfilPage)
  },
];
