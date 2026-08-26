import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cashOutline, calendarOutline, personOutline, pricetagOutline } from 'ionicons/icons';

import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { TransacaoModel } from 'src/app/model/transacao.model';
import { TransacaoService } from 'src/app/services/transacao.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UsuarioModel } from 'src/app/model/usuario.model';

@Component({
  selector: 'app-transacoes',
  templateUrl: './transacoes.page.html',
  styleUrls: ['./transacoes.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonIcon]
})
export class TransacoesPage implements OnInit {

  transacoes: TransacaoModel[] = [];
  usuarioLogado: UsuarioModel = new UsuarioModel();

  constructor(
    private transacaoService: TransacaoService,
    private usuarioService: UsuarioService,
    private router: Router,
    private toastController: ToastController,
  ) {
    addIcons({ cashOutline, calendarOutline, personOutline, pricetagOutline });
  }

  ngOnInit() { }

  ionViewWillEnter() {

    const possuiSessao = this.usuarioService.verificarSessao();

    if (!possuiSessao) {

      this.exibirMensagem('Não há usuário logado.');

      this.router.navigate(['/login']);

      return;
    }

    this.usuarioLogado = this.usuarioService.getUsuarioSessao();
    this.carregarTransacoes();
  }

  carregarTransacoes() {
    this.transacaoService.listarPorUsuario(this.usuarioLogado.cdUsuario).subscribe({
      next: (dados) => this.transacoes = dados
    });
  }

  souComprador(transacao: TransacaoModel): boolean {
    return transacao.usuario.cdUsuario === this.usuarioLogado.cdUsuario;
  }

  outroUsuario(transacao: TransacaoModel): UsuarioModel {
    return this.souComprador(transacao) ? transacao.anuncio.usuarioCria : transacao.usuario;
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 2000
    });
    toast.present();
  }
}