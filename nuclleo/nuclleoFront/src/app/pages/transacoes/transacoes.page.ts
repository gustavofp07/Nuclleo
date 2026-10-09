import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonIcon,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cashOutline, calendarOutline, personOutline, pricetagOutline } from 'ionicons/icons';

import { TransacaoModel } from 'src/app/model/transacao.model';
import { TokenModel } from 'src/app/model/token.model';
import { TransacaoService } from 'src/app/services/transacao.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-transacoes',
  templateUrl: './transacoes.page.html',
  styleUrls: ['./transacoes.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonIcon, IonSpinner]
})
export class TransacoesPage {
  token: TokenModel;
  transacoes: TransacaoModel[] = [];
  carregando: boolean = false;

  private nomesUsuarios = new Map<number, string>();

  constructor(
    private transacaoService: TransacaoService,
    private usuarioService: UsuarioService,
    private router: Router,
    private toastController: ToastController,
    private tokenService: TokenService
  ) {
    addIcons({ cashOutline, calendarOutline, personOutline, pricetagOutline });
    this.token = new TokenModel();
  }

  ionViewWillEnter() {
    if (!this.tokenService.temToken()) {
      this.exibirMensagem('Não há usuário logado.');
      this.router.navigate(['/login']);
      return;
    }

    this.token = this.tokenService.extrair();
    this.carregarTransacoes();
  }

  carregarTransacoes() {
    this.carregando = true;

    this.transacaoService.listarPorUsuario(this.token.cdUsuario).subscribe({
      next: (dados) => {
        this.transacoes = dados;
        this.carregarNomesUsuarios();
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.exibirMensagem('Erro ao carregar transações.');
      }
    });
  }

  souComprador(transacao: TransacaoModel): boolean {
    if (transacao.anuncio.tipoAnuncio === 'VENDA') {
      return transacao.usuario.cdUsuario === this.token.cdUsuario;
    }

    return this.cdCriadorAnuncio(transacao) === this.token.cdUsuario;
  }

  nomeOutroUsuario(transacao: TransacaoModel): string {
    return this.nomesUsuarios.get(this.cdOutroUsuario(transacao)) ?? '...';
  }

  private cdCriadorAnuncio(transacao: TransacaoModel): number {
    return transacao.anuncio.cdUsuarioCria || transacao.anuncio.usuarioCria?.cdUsuario;
  }

  private cdOutroUsuario(transacao: TransacaoModel): number {
    const cdCriador = this.cdCriadorAnuncio(transacao);
    return cdCriador === this.token.cdUsuario ? transacao.usuario.cdUsuario : cdCriador;
  }

  private carregarNomesUsuarios() {
    this.transacoes.forEach(transacao => {
      [transacao.usuario, transacao.anuncio.usuarioCria]
        .filter(usuario => usuario?.cdUsuario && usuario.nmUsuario)
        .forEach(usuario => this.nomesUsuarios.set(usuario.cdUsuario, usuario.nmUsuario));
    });

    const faltantes = [...new Set(this.transacoes.map(t => this.cdOutroUsuario(t)))]
      .filter(cdUsuario => cdUsuario && !this.nomesUsuarios.has(cdUsuario));

    if (faltantes.length === 0) {
      return;
    }

    forkJoin(
      faltantes.map(cdUsuario =>
        this.usuarioService.buscarUsuario(cdUsuario).pipe(
          map(usuario => ({ cdUsuario, nome: usuario.nmUsuario })),
          catchError(() => of({ cdUsuario, nome: 'Usuário indisponível' }))
        )
      )
    ).subscribe(resultados => {
      resultados.forEach(({ cdUsuario, nome }) => this.nomesUsuarios.set(cdUsuario, nome));
    });
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 2000,
      position: 'top'
    });
    await toast.present();
  }
}
