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
  IonButton,
  IonSpinner
} from '@ionic/angular/standalone';

import { AlertController, ToastController } from '@ionic/angular';

import { addIcons } from 'ionicons';
import { add, pricetagOutline, cartOutline, createOutline } from 'ionicons/icons';

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
    IonButton,
    IonSpinner
  ]
})
export class AnuncioMeusPage implements OnInit {
  usuario: UsuarioModel;
  anuncios: AnuncioModel[];
  carregando: boolean = false;

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
    this.carregando = true; 

    this.anuncioService.listarAnunciosPorUsuarioTipo(this.usuario.cdUsuario, this.tipo).subscribe({
      next: (anuncios: AnuncioModel[]) => {
        this.anuncios = anuncios;
        this.carregando = false; 
      },
      error: () => {
        this.carregando = false; 
        this.exibirMensagem('Erro ao carregar seus anúncios');
      }
    });
  }

  usuarioEhDono(anuncio: AnuncioModel) {
    return anuncio.usuarioCria?.cdUsuario === this.usuario.cdUsuario;
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