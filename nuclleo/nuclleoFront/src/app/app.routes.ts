import { Routes } from '@angular/router';

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
    loadComponent: () => import('./pages/tela-inicial/tela-inicial.page').then(m => m.TelaInicialPage)
  },
  {
    path: 'usuario-perfil',
    loadComponent: () => import('./pages/usuario-perfil/usuario-perfil.page').then(m => m.UsuarioPerfilPage)
  },
  {
    path: 'usuario-perfil/:cdUsuario',
    loadComponent: () => import('./pages/usuario-perfil/usuario-perfil.page').then(m => m.UsuarioPerfilPage)
  },
  {
    path: 'usuario-alterar',
    loadComponent: () => import('./pages/usuario-alterar/usuario-alterar.page').then(m => m.UsuarioAlterarPage)
  },
  {
    path: 'criar-comunidade',
    loadComponent: () => import('./pages/comunidade-criar/criar-comunidade.page').then(m => m.CriarComunidadePage)
  },
  {
    path: 'minhas-comunidades',
    loadComponent: () => import('./pages/comunidade-minhas/minhas-comunidades.page').then(m => m.MinhasComunidadesPage)
  },
  {
    path: 'criar-comunidade/:cdComunidade',
    loadComponent: () => import('./pages/comunidade-criar/criar-comunidade.page').then(m => m.CriarComunidadePage)
  },
  {
    path: 'criar-anuncio/:tipo',
    loadComponent: () => import('./pages/anuncio-criar/criar-anuncio.page').then(m => m.CriarAnuncioPage)
  },
  {
    path: 'criar-anuncio/:tipo/:cdAnuncio',
    loadComponent: () => import('./pages/anuncio-criar/criar-anuncio.page').then(m => m.CriarAnuncioPage)
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
  {
    path: 'anuncio-meus',
    loadComponent: () => import('./pages/anuncio-meus/anuncio-meus.page').then(m => m.AnuncioMeusPage)
  },
  {
    path: 'anuncio-meus/:tipo',
    loadComponent: () => import('./pages/anuncio-meus/anuncio-meus.page').then(m => m.AnuncioMeusPage)
  },
  {
    path: 'interesse',
    loadComponent: () => import('./pages/interesse/interesse').then(m => m.InteresseMeusPage)
  },
  {
    path: 'chat/:cdInteresse',
    loadComponent: () => import('./pages/chat/chat.page').then(m => m.ChatPage)
  },
  {
    path: 'chat',
    loadComponent: () => import('./pages/chat/chat.page').then( m => m.ChatPage)
  },
  {
    path: 'transacoes',
    loadComponent: () => import('./pages/transacoes/transacoes.page').then( m => m.TransacoesPage)
  },
  {
    path: 'conversas',
    loadComponent: () => import('./pages/conversas/conversas.page').then( m => m.ConversasPage)
  },
  {
    path: 'configuracoes',
    loadComponent: () => import('./pages/configuracoes/configuracoes.page').then(m => m.ConfiguracoesPage)
  },
  {
    path: 'admin/denuncias',
    loadComponent: () => import('./pages/admin-denuncias/admin-denuncias.page').then(m => m.AdminDenunciasPage)
  },
  {
    path: 'admin/denuncia/:cdDenuncia',
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
