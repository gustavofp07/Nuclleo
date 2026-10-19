import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { TokenService } from '../services/token.service';

// Sem login (ou com o token vencido): volta para o login
function exigirLogin(tokenService: TokenService, router: Router): UrlTree | null {
  if (!tokenService.estaAutenticado()) {
    tokenService.excluir();
    return router.createUrlTree(['/login']);
  }
  return null;
}

// Telas que qualquer pessoa logada pode abrir (usuário comum ou administrador)
export const autenticadoGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  return exigirLogin(tokenService, inject(Router)) ?? true;
};

// Telas do usuário comum: o administrador não negocia, então vai para o painel dele
export const usuarioGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const semLogin = exigirLogin(tokenService, router);
  if (semLogin) return semLogin;

  return tokenService.isAdmin() ? router.createUrlTree(['/admin/denuncias']) : true;
};

// Telas exclusivas do administrador
export const adminGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const semLogin = exigirLogin(tokenService, router);
  if (semLogin) return semLogin;

  return tokenService.isAdmin() ? true : router.createUrlTree(['/tela-inicial']);
};
