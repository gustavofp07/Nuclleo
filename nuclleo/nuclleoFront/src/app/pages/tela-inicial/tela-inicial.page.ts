import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonButtons,
  IonIcon,
  IonSpinner,
  IonToggle,
  IonSearchbar,
  ToastController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { locationOutline, calendarOutline, searchOutline } from 'ionicons/icons';

import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

import { ComunidadeModel } from 'src/app/model/comunidade.model';
import { TokenModel } from 'src/app/model/token.model';
import { ComunidadeService } from 'src/app/services/comunidade.service';
import { TokenService } from 'src/app/services/token.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-tela-inicial',
  templateUrl: './tela-inicial.page.html',
  styleUrls: ['./tela-inicial.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonMenuButton,
    IonButtons,
    IonIcon,
    IonSpinner,
    IonToggle,
    IonSearchbar
  ]
})
export class TelaInicialPage implements OnInit {
  private readonly CHAVE_PROXIMIDADE = 'buscarComunidadesProximas';
  private readonly destroyRef = inject(DestroyRef);
  private pesquisaSubject = new Subject<string>();

  token: TokenModel;
  comunidades: ComunidadeModel[] = [];

  buscarPorProximidade: boolean = false;
  pesquisa: string = '';

  carregandoComunidades: boolean = true;
  verificandoCep: boolean = false;

  constructor(
    private usuarioService: UsuarioService,
    private comunidadeService: ComunidadeService,
    private router: Router,
    private toastController: ToastController,
    private tokenService: TokenService
  ) {
    this.token = new TokenModel();
    addIcons({ locationOutline, calendarOutline, searchOutline });
  }

  ngOnInit() {
    this.pesquisaSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((termo: string) => this.pesquisarComunidades(termo));
  }

  ionViewWillEnter() {
    if (!this.tokenService.temToken()) {
      this.exibirMensagem('Não há usuário logado.');
      this.router.navigate(['/login']);
      return;
    }

    this.token = this.tokenService.extrair();
    this.buscarPorProximidade = localStorage.getItem(this.CHAVE_PROXIMIDADE) === 'true';
    this.pesquisa = '';

    this.pesquisarComunidades();
  }

  aoPesquisar(event: any) {
    this.pesquisaSubject.next(event.detail.value || '');
  }

  alterarBuscaProximidade() {
    if (!this.buscarPorProximidade) {
      this.aplicarBuscaProximidade();
      return;
    }

    this.verificandoCep = true;

    this.usuarioService.verificarCEP(this.token.cdUsuario).subscribe({
      next: (possuiCep: boolean) => {
        this.verificandoCep = false;

        if (!possuiCep) {
          this.desligarBuscaProximidade('Cadastre um CEP válido no seu perfil para ver comunidades próximas.');
          return;
        }

        this.aplicarBuscaProximidade();
      },
      error: () => {
        this.verificandoCep = false;
        this.desligarBuscaProximidade('Não foi possível verificar seu CEP. Tente novamente.');
      }
    });
  }

  private aplicarBuscaProximidade() {
    localStorage.setItem(this.CHAVE_PROXIMIDADE, String(this.buscarPorProximidade));
    this.pesquisarComunidades(this.pesquisa);
  }

  private desligarBuscaProximidade(mensagem: string) {
    this.buscarPorProximidade = false;
    localStorage.setItem(this.CHAVE_PROXIMIDADE, 'false');
    this.exibirMensagem(mensagem);
  }

  pesquisarComunidades(termo?: string) {
    this.carregandoComunidades = true;

    const busca$ = this.buscarPorProximidade
      ? this.comunidadeService.listarComunidadesProximas(this.token.cdUsuario, termo)
      : this.comunidadeService.listarComunidades(termo);

    busca$.subscribe({
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

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 3000,
      position: 'top'
    });
    await toast.present();
  }
}
