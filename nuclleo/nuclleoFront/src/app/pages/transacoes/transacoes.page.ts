import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cashOutline, calendarOutline, personOutline, pricetagOutline } from 'ionicons/icons';

import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/standalone';

import { TransacaoModel } from 'src/app/model/transacao.model';
import { TransacaoService } from 'src/app/services/transacao.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { TokenService } from 'src/app/services/token.service';
import { TokenModel } from 'src/app/model/token.model';

@Component({
  selector: 'app-transacoes',
  templateUrl: './transacoes.page.html',
  styleUrls: ['./transacoes.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonIcon]
})
export class TransacoesPage implements OnInit {
  token: TokenModel;

  transacoes: TransacaoModel[] = [];

  outro: UsuarioModel;

  constructor(
    private transacaoService: TransacaoService,
    private usuarioService: UsuarioService,
    private router: Router,
    private toastController: ToastController,
    private tokenService: TokenService,
  ) {
    addIcons({ cashOutline, calendarOutline, personOutline, pricetagOutline });
    this.token = new TokenModel();
    this.outro = new UsuarioModel();
  }

  ngOnInit() { }

  ionViewWillEnter() {
    const possuiToken = this.tokenService.temToken();

    if (!possuiToken) {
      this.exibirMensagem('Não há usuário logado.');
      this.router.navigate(['/login']);
      return;
    }

    this.token = this.tokenService.extrair();
    this.carregarTransacoes();
  }

  carregarTransacoes() {
    this.transacaoService.listarPorUsuario(this.token.cdUsuario).subscribe({
      next: (dados) => this.transacoes = dados
    });
  }

  souComprador(transacao: TransacaoModel): boolean {
    const anuncioEhVenda = transacao.anuncio.tipoAnuncio === 'VENDA';

    if (anuncioEhVenda) {
      return transacao.usuario.cdUsuario === this.token.cdUsuario;
    } else {
      return transacao.anuncio.cdUsuarioCria === this.token.cdUsuario;
    }
  }

  outroUsuario(transacao: TransacaoModel) {
    const anuncioEhVenda = transacao.anuncio.tipoAnuncio === 'VENDA';

    let codigo;

    if (anuncioEhVenda) {
      //return this.souComprador(transacao) ? transacao.anuncio.cdUsuarioCria : transacao.usuario.cdUsuario;
      if (this.souComprador(transacao)) {
        codigo = transacao.anuncio.cdUsuarioCria;
      } else {
        codigo = transacao.usuario.cdUsuario;
      }
    } else {
      //return this.souComprador(transacao) ? transacao.usuario.cdUsuario : transacao.anuncio.cdUsuarioCria;
      if (this.souComprador(transacao)) {
        codigo = transacao.usuario.cdUsuario;
      } else {
        codigo = transacao.anuncio.cdUsuarioCria;
      }
    }

    this.buscarUsuario(codigo);
  }

  private buscarUsuario(cdUsuario: number) {
    this.usuarioService.buscarUsuario(cdUsuario).subscribe({
      next: (usuario: UsuarioModel) => {
        this.outro = usuario;
      },
      error: (erro: any) => {
        console.log('Erro ao buscar usuário');
      }
    });
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 2000
    });
    toast.present();
  }
}