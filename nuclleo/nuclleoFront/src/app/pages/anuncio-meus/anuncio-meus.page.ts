import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router, ParamMap } from '@angular/router';
import { skip } from 'rxjs/operators';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonButtons,
  IonIcon,
  IonButton,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { add, pricetagOutline, cartOutline, imageOutline } from 'ionicons/icons';

import { AnuncioModel } from 'src/app/model/anuncio.model';
import { TokenModel } from 'src/app/model/token.model';
import { AnuncioService } from 'src/app/services/anuncio.service';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-anuncio-meus',
  templateUrl: './anuncio-meus.page.html',
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
  private readonly destroyRef = inject(DestroyRef);

  token: TokenModel;
  anuncios: AnuncioModel[] = [];
  carregando: boolean = false;
  tipo: 'venda' | 'compra' = 'venda';

  constructor(
    private route: ActivatedRoute,
    private anuncioService: AnuncioService,
    private toastController: ToastController,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.token = new TokenModel();
    addIcons({ add, pricetagOutline, cartOutline, imageOutline });
  }

  ngOnInit() {
    this.route.paramMap
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.definirTipo(params);
        this.carregarAnuncios();
      });
  }

  ionViewWillEnter() {
    if (!this.tokenService.temToken()) {
      this.router.navigate(['/login']);
      return;
    }

    this.token = this.tokenService.extrair();
    this.definirTipo(this.route.snapshot.paramMap);
    this.carregarAnuncios();
  }

  private definirTipo(params: ParamMap) {
    this.tipo = params.get('tipo') === 'compra' ? 'compra' : 'venda';
  }

  get titulo() {
    return this.tipo === 'venda' ? 'Meus anúncios de venda' : 'Meus anúncios de compra';
  }

  get subtitulo() {
    return this.tipo === 'venda'
      ? 'Veja e gerencie os itens que você está vendendo.'
      : 'Veja e gerencie os itens que você está procurando.';
  }

  get rotaCriar() {
    return this.tipo === 'venda' ? '/criar-anuncio/venda' : '/criar-anuncio/requerimento';
  }

  get icone() {
    return this.tipo === 'venda' ? 'pricetag-outline' : 'cart-outline';
  }

  get tituloVazio() {
    return this.tipo === 'venda' ? 'Nenhum anúncio de venda' : 'Nenhum anúncio de compra';
  }

  get mensagemVazio() {
    return this.tipo === 'venda'
      ? 'Você ainda não criou nenhum anúncio de venda. Que tal começar agora?'
      : 'Você ainda não criou nenhum anúncio de compra. Que tal começar agora?';
  }

  carregarAnuncios() {
    this.carregando = true;

    this.anuncioService.listarAnunciosPorUsuarioTipo(this.token.cdUsuario, this.tipo).subscribe({
      next: (anuncios: AnuncioModel[]) => {
        this.anuncios = anuncios;
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.exibirMensagem('Erro ao carregar seus anúncios.');
      }
    });
  }

  async exibirMensagem(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2000,
      position: 'top'
    });
    await toast.present();
  }
}
