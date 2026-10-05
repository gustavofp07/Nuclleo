import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  IonContent,
  IonLabel,
  IonAvatar,
  IonItem,
  IonButton,
  IonCardSubtitle,
  IonCardTitle,
  IonCard,
  IonCardHeader,
  IonList,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonButtons,
  IonIcon,
  IonSpinner,
  IonToggle,
  IonSearchbar
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { locationOutline, calendarOutline } from 'ionicons/icons';

import { Router } from '@angular/router';

import { UsuarioService } from 'src/app/services/usuario.service';

import { ToastController } from '@ionic/angular/standalone';

import { HttpClient } from '@angular/common/http';

//import para a pesquisa de comunidades
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { AnuncioModel } from 'src/app/model/anuncio.model';
import { AnuncioService } from 'src/app/services/anuncio.service';
import { ComunidadeModel } from 'src/app/model/comunidade.model';
import { ComunidadeService } from 'src/app/services/comunidade.service';
import { TokenService } from 'src/app/services/token.service';
import { TokenModel } from 'src/app/model/token.model';

@Component({
  selector: 'app-tela-inicial',
  templateUrl: './tela-inicial.page.html',
  styleUrls: ['./tela-inicial.page.scss'],
  standalone: true,

  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonMenuButton,
    IonButtons,
    IonIcon,
    CommonModule,
    FormsModule,
    RouterLink,
    IonSpinner,
    IonToggle,
    IonSearchbar
  ]
})

export class TelaInicialPage implements OnInit {
  token: TokenModel;

  comunidades: ComunidadeModel[] = [];

  buscarPorProximidade: boolean;
  pesquisa: string;

  anunciosRecomendados: AnuncioModel[] = [];

  carregandoAnuncios: boolean = true;
  carregandoComunidades: boolean = true;

  // Subject para gerenciar a pesquisa de comunidades
  private pesquisaSubject = new Subject<string>();

  constructor(
    //private usuarioService: UsuarioService,
    private comunidadeService: ComunidadeService,
    private router: Router,
    private toastController: ToastController,
    private http: HttpClient,
    private anuncioService: AnuncioService,
    private tokenService: TokenService
  ) {
    this.token = new TokenModel();
    this.buscarPorProximidade = false;
    this.pesquisa = "";
    addIcons({
      locationOutline,
      calendarOutline
    });
  }

  ngOnInit() {
    //na primeira vez que a tela é carregada, não há preferência de proximidade salva no localStorage
    localStorage.setItem('buscarComunidadesProximas', String(this.buscarPorProximidade));

    this.pesquisaSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe((termo: string) => {
        //this.pesquisa = termo;
        this.pesquisarComunidades(termo);
      });
  }

  ionViewWillEnter() {
    this.token = this.tokenService.extrair();
    let aux = this.tokenService.temToken();

    if (aux == false) {
      this.exibirMensagem("Não há usuário logado.");
      this.router.navigate(['/login']);
      return;
    }

    this.carregarPreferenciaProximidade();
    this.pesquisa = '';

    this.pesquisarComunidades();
  }

  carregarPreferenciaProximidade() {
    const preferencia = localStorage.getItem('buscarComunidadesProximas');

    if (preferencia === "true") {
      this.buscarPorProximidade = true;
    } else if (preferencia === "false") {
      this.buscarPorProximidade = false;
    } else {
      this.exibirMensagem("Erro ao carregar preferência de proximidade.");
    }
  }

  aoPesquisar(event: any) {
    const termo = event.detail.value || '';
    this.pesquisaSubject.next(termo);
  }

  alterarBuscaProximidade() {
    localStorage.setItem('buscarComunidadesProximas', String(this.buscarPorProximidade));

    this.pesquisarComunidades(this.pesquisa);
  }

  pesquisarComunidades(termo?: string) {
    this.token = this.tokenService.extrair();
    this.carregandoComunidades = true;

    if (this.buscarPorProximidade === true) {
      this.comunidadeService.listarComunidadesProximas(this.token.cdUsuario, termo).subscribe({
        next: (comunidades: ComunidadeModel[]) => {
          this.comunidades = comunidades;
          this.carregandoComunidades = false;
        },
        error: (erro: any) => {
          console.error('Erro ao pesquisar comunidades próximas:', erro);
          this.carregandoComunidades = false;
          this.exibirMensagem(erro.error?.message || 'Erro ao pesquisar comunidades.');
        }
      });
    } else {
      this.comunidadeService.listarComunidades(termo).subscribe({
        next: (comunidades: ComunidadeModel[]) => {
          this.comunidades = comunidades;
          this.carregandoComunidades = false;
        },
        error: (erro: any) => {
          console.error('Erro ao pesquisar comunidades:', erro);
          this.carregandoComunidades = false;
          this.exibirMensagem(erro.error?.message || 'Erro ao pesquisar comunidades.');
        }
      });
    }
  }

  onErroImagem(anuncio: any) {
    anuncio.ftAnuncio = null;
  }

  async exibirMensagem(texto: string) {
    const toast =
      await this.toastController.create({
        message: texto,
        duration: 3000
      });
    toast.present();
  }
}