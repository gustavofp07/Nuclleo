import { Routes } from '@angular/router';
import { adminGuard, autenticadoGuard, usuarioGuard } from './guards/autenticacao.guard';
import { cadastroCompletoGuard } from './guards/cadastro-completo.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/usuario-login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'usuario-cadastro',
    loadComponent: () => import('./pages/usuario-cadastro/usuario-cadastro.page').then(m => m.UsuarioCadastroPage)
  },
  {
    path: 'tela-inicial',
    canActivate: [usuarioGuard],
    loadComponent: () => import('./pages/tela-inicial/tela-inicial.page').then(m => m.TelaInicialPage)
  },
  {
    path: 'usuario-perfil',
    canActivate: [autenticadoGuard],
    loadComponent: () => import('./pages/usuario-perfil/usuario-perfil.page').then(m => m.UsuarioPerfilPage)
  },
  {
    path: 'usuario-perfil/:cdUsuario',
    canActivate: [autenticadoGuard],
    loadComponent: () => import('./pages/usuario-perfil/usuario-perfil.page').then(m => m.UsuarioPerfilPage)
  },
  {
    path: 'usuario-alterar',
    canActivate: [autenticadoGuard],
    loadComponent: () => import('./pages/usuario-alterar/usuario-alterar.page').then(m => m.UsuarioAlterarPage)
  },
  {
    path: 'criar-comunidade',
    canActivate: [usuarioGuard, cadastroCompletoGuard],
    loadComponent: () => import('./pages/comunidade-criar/criar-comunidade.page').then(m => m.CriarComunidadePage)
  },
  {
    path: 'minhas-comunidades',
    canActivate: [usuarioGuard],
    loadComponent: () => import('./pages/comunidade-minhas/minhas-comunidades.page').then(m => m.MinhasComunidadesPage)
  },
  {
    path: 'criar-comunidade/:cdComunidade',
    canActivate: [usuarioGuard],
    loadComponent: () => import('./pages/comunidade-criar/criar-comunidade.page').then(m => m.CriarComunidadePage)
  },
  {
    path: 'criar-anuncio/:tipo',
    canActivate: [usuarioGuard, cadastroCompletoGuard],
    loadComponent: () => import('./pages/anuncio-criar/criar-anuncio.page').then(m => m.CriarAnuncioPage)
  },
  {
    path: 'criar-anuncio/:tipo/:cdAnuncio',
    canActivate: [usuarioGuard],
    loadComponent: () => import('./pages/anuncio-criar/criar-anuncio.page').then(m => m.CriarAnuncioPage)
  },
  {
    path: 'comunidade-tela/:cdComunidade',
    canActivate: [usuarioGuard],
    loadComponent: () => import('./pages/comunidade-tela/comunidade-tela.page').then(m => m.ComunidadePerfilPage)
  },
  {
    path: 'anuncio-tela',
    canActivate: [usuarioGuard],
    loadComponent: () => import('./pages/anuncio-tela/anuncio-tela.page').then(m => m.AnuncioTelaPage)
  },
  {
    path: 'anuncio-tela/:cdAnuncio',
    canActivate: [usuarioGuard],
    loadComponent: () => import('./pages/anuncio-tela/anuncio-tela.page').then(m => m.AnuncioTelaPage)
  },
  {
    path: 'anuncio-meus',
    canActivate: [usuarioGuard],
    loadComponent: () => import('./pages/anuncio-meus/anuncio-meus.page').then(m => m.AnuncioMeusPage)
  },
  {
    path: 'anuncio-meus/:tipo',
    canActivate: [usuarioGuard],
    loadComponent: () => import('./pages/anuncio-meus/anuncio-meus.page').then(m => m.AnuncioMeusPage)
  },
  {
    path: 'interesse',
    canActivate: [usuarioGuard],
    loadComponent: () => import('./pages/interesse/interesse').then(m => m.InteresseMeusPage)
  },
  {
    path: 'chat/:cdInteresse',
    canActivate: [usuarioGuard],
    loadComponent: () => import('./pages/chat/chat.page').then(m => m.ChatPage)
  },
  {
    path: 'chat',
    canActivate: [usuarioGuard],
    loadComponent: () => import('./pages/chat/chat.page').then( m => m.ChatPage)
  },
  {
    path: 'transacoes',
    canActivate: [usuarioGuard],
    loadComponent: () => import('./pages/transacoes/transacoes.page').then( m => m.TransacoesPage)
  },
  {
    path: 'conversas',
    canActivate: [usuarioGuard],
    loadComponent: () => import('./pages/conversas/conversas.page').then( m => m.ConversasPage)
  },
  {
    path: 'configuracoes',
    canActivate: [autenticadoGuard],
    loadComponent: () => import('./pages/configuracoes/configuracoes.page').then(m => m.ConfiguracoesPage)
  },
  {
    path: 'admin/denuncias',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin-denuncias/admin-denuncias.page').then(m => m.AdminDenunciasPage)
  },
  {
    path: 'admin/denuncia/:cdDenuncia',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin-denuncia/admin-denuncia.page').then(m => m.AdminDenunciaPage)
  },
  {
    path: 'nao-encontrado',
    loadComponent: () => import('./pages/nao-encontrado/nao-encontrado.page').then( m => m.NaoEncontradoPage)
  },
  {
    path: '**',
    redirectTo: 'nao-encontrado'
  }
];
