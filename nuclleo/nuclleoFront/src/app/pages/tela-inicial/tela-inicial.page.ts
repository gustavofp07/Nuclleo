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

import { Router } from '@angular/router';

import { UsuarioService } from 'src/app/services/usuario.service';

import { ToastController } from '@ionic/angular';

import { HttpClient } from '@angular/common/http';

//import para a pesquisa de comunidades
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { AnuncioModel } from 'src/app/model/anuncio.model';
import { AnuncioService } from 'src/app/services/anuncio.service';
import { ComunidadeModel } from 'src/app/model/comunidade.model';
import { ComunidadeService } from 'src/app/services/comunidade.service';

@Component({
  selector: 'app-tela-inicial',
  templateUrl: './tela-inicial.page.html',
  styleUrls: ['./tela-inicial.page.scss'],
  standalone: true,

  imports: [
    IonContent,
    IonLabel,
    IonAvatar,
    IonItem,
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
    CommonModule,
    FormsModule,
    IonButton,
    RouterLink,
    IonIcon,
    IonSpinner,
    IonToggle,
    IonSearchbar
  ]
})

export class TelaInicialPage implements OnInit {

  comunidades: ComunidadeModel[] = [];

  buscarPorProximidade: boolean = false;
  pesquisaComunidade: string = '';

  anunciosRecomendados: AnuncioModel[] = [];

  carregandoAnuncios: boolean = true;
  carregandoComunidades: boolean = true;

  // Subject para gerenciar a pesquisa de comunidades
  private pesquisaSubject = new Subject<string>();

  constructor(
    private usuarioService: UsuarioService,
    private comunidadeService: ComunidadeService,
    private router: Router,
    private toastController: ToastController,
    private http: HttpClient,
    private anuncioService: AnuncioService,
  ) { }

  ngOnInit() {
    let aux = this.usuarioService.verificarSessao();

    if (aux == false) {
      this.exibirMensagem("Não há usuário logado.");
      this.router.navigate(['/login']);
      return;
    }

    this.carregarPreferenciaProximidade();

    this.carregarComunidades();
    this.carregarAnunciosRecomendados();


    this.pesquisaSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe((termo: string) => {
        this.pesquisarComunidades(termo);
      });
  }

  onErroImagem(anuncio: any) {
    anuncio.ftAnuncio = null;
  }

  ionViewWillEnter() {
    let aux = this.usuarioService.verificarSessao();

    if (aux == false) {
      this.exibirMensagem("Não há usuário logado.");
      this.router.navigate(['/login']);
      return;
    }

    this.carregarPreferenciaProximidade();
    this.pesquisaComunidade = '';
    this.carregarComunidades();
    this.carregarAnunciosRecomendados();
  }

  aoPesquisar(event: any) {
    const termo = event.detail.value || '';
    this.pesquisaSubject.next(termo);
  }

  alterarBuscaProximidade() {
    localStorage.setItem('buscarComunidadesProximas', String(this.buscarPorProximidade));
    this.pesquisaComunidade = '';
    this.carregarComunidades();
  }

  carregarPreferenciaProximidade() {
    const preferencia = localStorage.getItem('buscarComunidadesProximas');

    this.buscarPorProximidade = (preferencia === 'true');
  }

  carregarComunidades() {
    this.carregandoComunidades = true;

    if (this.buscarPorProximidade === true) {
      this.carregarComunidadesProximas();
    } else {
      this.carregarTodasComunidades();
    }
  }

  carregarTodasComunidades() {
    this.comunidadeService.listarComunidades().subscribe({
      next: (comunidades: ComunidadeModel[]) => {
        this.comunidades = comunidades;
        this.carregandoComunidades = false;
      },
      error: (erro: any) => {
        console.error('Erro ao carregar comunidades:', erro);
        this.carregandoComunidades = false;
      }
    });
  }

  carregarComunidadesProximas() {
    const usuario = this.usuarioService.getUsuarioSessao();

    // O backend valida CEP por ID do usuário autenticado.
    this.usuarioService.verificarCEP(usuario.cdUsuario).subscribe({
      next: (possuiCep: boolean) => {
        if (possuiCep) {

          this.comunidadeService.listarComunidadesProximas(usuario.cdUsuario).subscribe({
            next: (comunidades: ComunidadeModel[]) => {
              this.comunidades = comunidades;
              this.carregandoComunidades = false;
            },
            error: (erro: any) => {
              console.error('Erro ao carregar comunidades próximas: ', erro);
              this.exibirMensagem("Erro! " + erro.error.message);
              this.carregandoComunidades = false;
            }
          });

        } else {

          this.casoDeErro();
          return;
        }
      },
      error: (erro: any) => {
        console.error('Erro ao verificar CEP: ', erro);
        this.casoDeErro();
        return;
      }
    });

  }

  private casoDeErro() {
    this.buscarPorProximidade = false;
    localStorage.setItem('buscarComunidadesProximas', String(this.buscarPorProximidade));
    this.exibirMensagem("Erro!! O usuário não possui CEP cadastrado.");

    this.carregarTodasComunidades();
  }


  carregarAnunciosRecomendados() {
    this.carregandoAnuncios = true;

    this.anuncioService.listarTodos().subscribe({
      next: (dados) => {
        this.anunciosRecomendados = dados
          .sort(() => Math.random() - 0.5)
          .slice(0, 5);
        this.carregandoAnuncios = false;
      },
      error: (erro: any) => {
        console.error('Erro ao carregar anúncios recomendados.', erro);
        this.carregandoAnuncios = false;
      }
    });
  }

  pesquisarComunidades(termo: string) {
    const usuario = this.usuarioService.getUsuarioSessao();

    if (this.buscarPorProximidade === true) {
      this.comunidadeService.listarComunidadesProximas(usuario.cdUsuario, termo).subscribe({
        next: (comunidades: ComunidadeModel[]) => {
          this.comunidades = comunidades;
        },
        error: (erro: any) => {
          console.error('Erro ao pesquisar comunidades próximas: ', erro);
          this.exibirMensagem(erro.error?.message || 'Erro ao pesquisar comunidades.');
        }
      });
    } else {
      this.comunidadeService.listarComunidades(termo).subscribe({
        next: (comunidades: ComunidadeModel[]) => {
          this.comunidades = comunidades;
        },
        error: (erro: any) => {
          console.error('Erro ao pesquisar comunidades: ', erro);
          this.exibirMensagem(erro.error?.message || 'Erro ao pesquisar comunidades.');
        }
      });
    }
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