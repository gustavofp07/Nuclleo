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
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'usuario-cadastro',
    loadComponent: () => import('./pages/usuario-cadastro/usuario-cadastro.page').then(m => m.UsuarioCadastroPage)
  },
  {
    path: 'tela-inicial',
    loadComponent: () => import('./pages/tela-inicial/tela-inicial.page').then(m => m.TelaInicialPage)
  },
  {
    path: 'usuario-perfil',
    loadComponent: () => import('./pages/usuario-perfil/usuario-perfil.page').then(m => m.UsuarioPerfilPage)
  },
  {
    path: 'usuario-alterar',
    loadComponent: () => import('./pages/usuario-alterar/usuario-alterar.page').then(m => m.UsuarioAlterarPage)
  },
  {
    path: 'minhas-comunidades',
    loadComponent: () => import('./pages/minhas-comunidades/minhas-comunidades.page').then(m => m.MinhasComunidadesPage)
  },
  {
    path: 'criar-comunidade',
    loadComponent: () => import('./pages/criar-comunidade/criar-comunidade.page').then(m => m.CriarComunidadePage)
  },
  {
    path: 'minhas-comunidades',
    loadComponent: () => import('./pages/minhas-comunidades/minhas-comunidades.page').then(m => m.MinhasComunidadesPage)
  },
  {
    path: 'criar-comunidade',
    loadComponent: () => import('./pages/criar-comunidade/criar-comunidade.page').then(m => m.CriarComunidadePage)
  },
  {
    path: 'criar-comunidade/:cdComunidade',
    loadComponent: () => import('./pages/criar-comunidade/criar-comunidade.page').then(m => m.CriarComunidadePage)
  },
  {
    path: 'criar-anuncio/:tipo',
    loadComponent: () => import('./pages/criar-anuncio/criar-anuncio.page').then(m => m.CriarAnuncioPage)
  },
  {
    path: 'criar-anuncio/:tipo/:cdAnuncio',
    loadComponent: () => import('./pages/criar-anuncio/criar-anuncio.page').then(m => m.CriarAnuncioPage)
  },
  {
    path: 'comunidade-tela/:cdComunidade',
    loadComponent: () => import('./pages/comunidade-tela/comunidade-tela.page').then(m => m.ComunidadePerfilPage)
  },
  {
    path: 'anuncio-tela',
    loadComponent: () => import('./pages/anuncio-tela/anuncio-tela.page').then(m => m.AnuncioTelaPage)
  },
  {
    path: 'anuncio-tela/:cdAnuncio',
    loadComponent: () => import('./pages/anuncio-tela/anuncio-tela.page').then(m => m.AnuncioTelaPage)
  },





];
