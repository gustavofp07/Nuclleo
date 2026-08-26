import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonButtons,
  IonIcon
} from '@ionic/angular/standalone';

import { ToastController } from '@ionic/angular';

import { addIcons } from 'ionicons';
import { chatbubblesOutline } from 'ionicons/icons';

import { InteresseService } from 'src/app/services/interesse.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { InteresseModel } from 'src/app/model/interesse.model';
import { UsuarioModel } from 'src/app/model/usuario.model';

interface ConversaView {
  cdInteresse: number;
  nomeOutroUsuario: string;
  fotoOutroUsuario: string | null;
  nmAnuncio: string;
  finalizado: boolean;
}

@Component({
  selector: 'app-conversas',
  templateUrl: './conversas.page.html',
  styleUrls: ['./conversas.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonMenuButton,
    IonButtons,
    IonIcon
  ]
})
export class ConversasPage implements OnInit {

  usuarioLogado: UsuarioModel = new UsuarioModel();
  conversas: ConversaView[] = [];

  constructor(
    private interesseService: InteresseService,
    private usuarioService: UsuarioService,
    private toastController: ToastController,
    private router: Router,
  ) {
    addIcons({ chatbubblesOutline });
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

    this.carregarConversas();
  }

  carregarConversas() {

    // busca os interesses onde o usuário é o interessado e onde é o anunciante,
    // e mantém só os que já foram aceitos (aceito === true)
    this.interesseService.listarPorUsuario(this.usuarioLogado.cdUsuario).subscribe({
      next: (comoInteressado) => {

        this.interesseService.listarPorInteressados(this.usuarioLogado.cdUsuario).subscribe({
          next: (comoAnunciante) => {

            const todos = [...comoInteressado, ...comoAnunciante];
            const aceitos = todos.filter(i => (i as any).aceito === true);

            const mapa = new Map<number, InteresseModel>();
            aceitos.forEach(i => mapa.set(i.id!, i));

            this.conversas = Array.from(mapa.values()).map(interesse => this.mapearConversa(interesse));
          },
          error: () => this.exibirMensagem('Erro ao carregar conversas.')
        });
      },
      error: () => this.exibirMensagem('Erro ao carregar conversas.')
    });
  }

  mapearConversa(interesse: InteresseModel): ConversaView {

    const souEuOInteressado = interesse.usuario.cdUsuario === this.usuarioLogado.cdUsuario;

    return {
      cdInteresse: interesse.id!,
      nomeOutroUsuario: souEuOInteressado
        ? interesse.anuncio.usuarioCria.nmUsuario
        : interesse.usuario.nmUsuario,
      fotoOutroUsuario: souEuOInteressado
        ? interesse.anuncio.usuarioCria.ftUsuario
        : interesse.usuario.ftUsuario,
      nmAnuncio: interesse.anuncio.nmAnuncio,
      finalizado: interesse.finalizado
    };
  }

  abrirChat(cdInteresse: number) {
    this.router.navigate(['/chat', cdInteresse]);
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({ message: texto, duration: 2000 });
    toast.present();
  }
}