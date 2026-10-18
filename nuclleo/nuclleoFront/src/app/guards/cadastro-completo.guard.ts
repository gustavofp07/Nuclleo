import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';
import { catchError, map, of } from 'rxjs';

import { TokenService } from '../services/token.service';
import { UsuarioService } from '../services/usuario.service';

// Criar anúncio ou comunidade exige o cadastro completo: CPF e CEP preenchidos
export const cadastroCompletoGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const usuarioService = inject(UsuarioService);
  const alertController = inject(AlertController);
  const router = inject(Router);

  if (!tokenService.temToken()) {
    return router.createUrlTree(['/login']);
  }

  const token = tokenService.extrair();

  return usuarioService.buscarUsuario(token.cdUsuario).pipe(
    map(usuario => {
      const temCpf = !!usuario.cpf?.trim();
      const temCep = !!usuario.cep?.trim();

      if (temCpf && temCep) {
        return true;
      }

      avisarCadastroIncompleto(alertController, router, temCpf, temCep);
      return false;
    }),
    catchError(() => of(false))
  );
};

async function avisarCadastroIncompleto(alertController: AlertController, router: Router,
  temCpf: boolean, temCep: boolean) {
  const faltando = [!temCpf && 'CPF', !temCep && 'CEP'].filter(Boolean).join(' e ');

  const alert = await alertController.create({
    header: 'Complete seu cadastro',
    message: `Para criar anúncios e comunidades, informe seu ${faltando} no perfil.`,
    buttons: [
      { text: 'Agora não', role: 'cancel' },
      { text: 'Completar', handler: () => { router.navigate(['/usuario-alterar']); } }
    ]
  });

  await alert.present();
}
