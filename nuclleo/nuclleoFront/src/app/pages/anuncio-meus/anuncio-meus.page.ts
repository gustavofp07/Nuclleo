import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonButtons,
  IonIcon,
  IonButton
} from '@ionic/angular/standalone';

import { AlertController, ToastController } from '@ionic/angular';

import { addIcons } from 'ionicons';
import { add, pricetagOutline, cartOutline, trashOutline, createOutline } from 'ionicons/icons';

import { AnuncioService } from 'src/app/services/anuncio.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { AnuncioModel } from 'src/app/model/anuncio.model';

@Component({
  selector: 'app-anuncio-meus',
  templateUrl: './anuncio-meus.page.html',
  styleUrls: ['./anuncio-meus.page.scss'],
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
    IonIcon,
    IonButton
  ]
})
export class AnuncioMeusPage implements OnInit {
  usuario: UsuarioModel;
  anuncios: AnuncioModel[];

  tipo: 'venda' | 'compra' = 'venda';

  constructor(
    private route: ActivatedRoute,
    private anuncioService: AnuncioService,
    private alertController: AlertController,
    private toastController: ToastController,
    private usuarioService: UsuarioService) {
    this.usuario = new UsuarioModel();
    this.anuncios = [];
    addIcons({
      add,
      pricetagOutline,
      cartOutline,
      trashOutline,
      createOutline
    });
  }

  ngOnInit() {
    this.usuario = this.usuarioService.getUsuarioSessao();

    this.route.paramMap.subscribe(params => {
      const tipoParam = params.get('tipo');
      this.tipo = tipoParam === 'compra' ? 'compra' : 'venda';

      if (this.usuario) {
        this.carregarAnuncios();
      }
    });
  }

  ionViewWillEnter() {
    if (this.usuario) {
      this.carregarAnuncios();
    }
  }

  get titulo() {
    return this.tipo === 'venda' ? 'Meus anúncios de venda' : 'Meus anúncios de compra';
  }

  get subtitulo() {
    return this.tipo === 'venda'
      ? 'Veja e gerencie os itens que você está vendendo'
      : 'Veja e gerencie os itens que você está procurando';
  }

  get rotaCriar() {
    return this.tipo === 'venda' ? '/criar-anuncio/venda' : '/criar-anuncio/requerimento';
  }

  get icone() {
    return this.tipo === 'venda' ? 'pricetag-outline' : 'cart-outline';
  }

  get mensagemVazio() {
    return this.tipo === 'venda'
      ? 'Você ainda não criou nenhum anúncio de venda. Que tal começar agora?'
      : 'Você ainda não criou nenhum anúncio de compra. Que tal começar agora?';
  }

  get tituloVazio() {
    return this.tipo === 'venda' ? 'Nenhum anúncio de venda' : 'Nenhum anúncio de compra';
  }

  carregarAnuncios() {
    this.anuncioService.listarAnunciosPorUsuarioTipo(this.usuario.cdUsuario, this.tipo).subscribe({
      next: (anuncios: AnuncioModel[]) => {
        this.anuncios = anuncios;
      },
      error: () => {
        this.exibirMensagem('Erro ao carregar seus anúncios');
      }
    });
  }

  usuarioEhDono(anuncio: AnuncioModel) {
    return anuncio.usuarioCria?.cdUsuario === this.usuario.cdUsuario;
  }

  async confirmarExclusao(anuncio: AnuncioModel) {
    const alert =
      await this.alertController.create({
        header: 'Excluir anúncio',
        message: 'Deseja realmente excluir este anúncio?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Excluir',
            role: 'destructive',
            handler: () => {
              this.excluirAnuncio(anuncio);
            }
          }
        ]
      });
    await alert.present();
  }

  excluirAnuncio(anuncio: AnuncioModel) {
    if (!this.usuarioEhDono(anuncio)) {
      this.exibirMensagem('Apenas o autor pode excluir este anúncio.');
      return;
    }

    this.anuncioService.excluirAnuncio(anuncio.cdAnuncio).subscribe({
      next: () => {
        this.exibirMensagem('Anúncio excluído com sucesso');
        this.carregarAnuncios();
      },
      error: () => {
        this.exibirMensagem('Erro ao excluir anúncio.');
      }
    });
  }

  async exibirMensagem(mensagem: string) {
    const toast =
      await this.toastController.create({
        message: mensagem,
        duration: 2000,
        position: 'top'
      });
    await toast.present();
  }
}