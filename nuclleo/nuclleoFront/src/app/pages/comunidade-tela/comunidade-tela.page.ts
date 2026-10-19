import { Component, OnDestroy, NgZone, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon,
  IonMenuButton,
  IonSpinner,
  IonModal,
  IonList,
  IonItem,
  IonLabel,
  IonPopover
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  peopleOutline,
  personOutline,
  settingsOutline,
  trashOutline,
  logOutOutline,
  personRemoveOutline,
  closeOutline,
  chatbubblesOutline,
  locationOutline,
  pricetagOutline,
  imageOutline
} from 'ionicons/icons';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AlertController, ToastController } from '@ionic/angular/standalone';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AnuncioModel } from 'src/app/model/anuncio.model';
import { AnuncioComunidadeService } from 'src/app/services/anuncio-comunidade.service';
import { ComunidadeModel } from 'src/app/model/comunidade.model';
import { ComunidadeService } from 'src/app/services/comunidade.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UsuarioComunidadeService } from 'src/app/services/usuario-comunidade.service';
import { UsuarioComunidadeModel } from 'src/app/model/usuario-comunidade.model';
import { ComunidadeEventosService, EventoComunidade } from 'src/app/services/comunidade-eventos.service';
import { ChatComunidadeComponent } from 'src/app/components/chat-comunidade/chat-comunidade.component';
import { TokenModel } from 'src/app/model/token.model';
import { TokenService } from 'src/app/services/token.service';
import { UsuarioModel } from 'src/app/model/usuario.model';

@Component({
  selector: 'app-comunidade-tela',
  templateUrl: './comunidade-tela.page.html',
  styleUrls: ['./comunidade-tela.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonButtons,
    IonIcon,
    IonMenuButton,
    CommonModule,
    RouterLink,
    IonSpinner,
    IonModal,
    IonList,
    IonItem,
      IonLabel,
    IonPopover,
    ChatComunidadeComponent
  ]
})
export class ComunidadePerfilPage implements OnDestroy {
  token: TokenModel;
  usuarioLogado: UsuarioModel;

  @ViewChild('modalMembros') modalMembros!: IonModal;

  comunidade: ComunidadeModel;
  abaSelecionada: 'perfil' | 'chat' | 'anuncios' = 'perfil';
  usuarioEntrouNaComunidade = false;
  usuarioEhAdmin = false;
  carregandoVinculo = true;
  carregandoComunidade = true;
  carregandoAnuncios = true;
  carregandoMaisAnuncios = false;
  paginaAnuncios = 0;
  ultimaPaginaAnuncios = true;
  carregandoMembros = true;
  entrandoComunidade = false;
  saindoComunidade = false;
  totalUsuarios: number = 0;
  codigoVinculo: number | null = null;

  membros: UsuarioComunidadeModel[] = [];
  mostrarMembros: boolean = false;

  popoverAberto = false;
  eventoPopover: Event | undefined;
  membroSelecionado: UsuarioComunidadeModel | null = null;

  anuncios: AnuncioModel[] = [];

  private eventosSub?: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private comunidadeService: ComunidadeService,
    private usuarioService: UsuarioService,
    private usuarioComunidadeService: UsuarioComunidadeService,
    private anuncioComunidadeService: AnuncioComunidadeService,
    private tokenService: TokenService,
    private eventosService: ComunidadeEventosService,
    private alertController: AlertController,
    private toastController: ToastController,
    private ngZone: NgZone
  ) {
    this.token = new TokenModel();
    this.usuarioLogado = new UsuarioModel();
    addIcons({
      calendarOutline,
      peopleOutline,
      personOutline,
      settingsOutline,
      trashOutline,
      logOutOutline,
      personRemoveOutline,
      closeOutline,
      chatbubblesOutline,
      locationOutline,
      pricetagOutline,
      imageOutline
    });

    this.comunidade = new ComunidadeModel();
  }

  ngOnDestroy() {
    this.pararEscutaEventos();
  }

  ionViewWillEnter() {
    this.token = this.tokenService.extrair();
    const possuiSessao = this.tokenService.temToken();

    if (!possuiSessao) {
      this.exibirMensagem('Não há usuário logado.');
      this.router.navigate(['/login']);
      return;
    }

    const cdComunidade = Number(this.activatedRoute.snapshot.paramMap.get('cdComunidade'));

    this.abaSelecionada = 'perfil';
    this.usuarioEntrouNaComunidade = false;
    this.usuarioEhAdmin = false;
    this.carregandoVinculo = true;
    this.carregandoComunidade = true;
    this.carregandoAnuncios = true;
    this.carregandoMembros = true;
    this.anuncios = [];

    this.membros = [];
    this.mostrarMembros = false;
    this.popoverAberto = false;
    this.membroSelecionado = null;

    this.iniciarEscutaEventos();

    this.comunidadeService.buscarComunidade(cdComunidade).subscribe({
      next: (comunidade) => {
        this.comunidade = comunidade;
        this.usuarioEhAdmin = this.verificarUsuarioAdmin();
        this.usuarioEntrouNaComunidade = this.usuarioEhAdmin;
        this.carregandoComunidade = false;
        this.verificarUsuarioNaComunidade(cdComunidade);
        this.carregarTotalUsuarios(cdComunidade);
      },
      error: () => {
        this.carregandoVinculo = false;
        this.carregandoComunidade = false;
        this.carregandoMembros = false;
        this.exibirMensagem(
          'Erro ao carregar comunidade.'
        );
      }
    });
  }

  ionViewWillLeave() {
    this.pararEscutaEventos();
  }

  private iniciarEscutaEventos() {
    this.pararEscutaEventos();

    this.token = this.tokenService.extrair();
    if (!this.token.cdUsuario) {
      return;
    }

    this.eventosSub = this.eventosService.conectar(this.token.cdUsuario).subscribe({
      next: (evento) => this.tratarEvento(evento)
    });
  }

  private pararEscutaEventos() {
    this.eventosSub?.unsubscribe();
    this.eventosSub = undefined;
  }

  private tratarEvento(evento: EventoComunidade) {
    if (evento.tipo === 'CONECTADO') {
      this.revalidarVinculo();
      return;
    }

    if (evento.cdComunidade !== this.comunidade?.cdComunidade) {
      return;
    }

    if (evento.tipo === 'EXPULSO') {
      this.aplicarRemocao();
    }
  }

  private revalidarVinculo() {
    if (
      this.carregandoVinculo ||
      this.carregandoComunidade ||
      !this.comunidade?.cdComunidade ||
      this.usuarioEhAdmin ||
      !this.usuarioEntrouNaComunidade
    ) {
      return;
    }

    this.token = this.tokenService.extrair();
    if (!this.token.cdUsuario) {
      return;
    }

    this.usuarioComunidadeService.listarComunidadesPorUsuario(this.token.cdUsuario).subscribe({
      next: (vinculos) => {
        const vinculo = vinculos.find(
          (v) => v.comunidade.cdComunidade === this.comunidade.cdComunidade
        );
        if (!vinculo) {
          this.aplicarRemocao();
        }
      },
      error: () => { }
    });
  }

  private aplicarRemocao() {
    this.ngZone.run(() => {
      this.mostrarMembros = false;
      this.popoverAberto = false;
      this.membroSelecionado = null;

      this.usuarioEntrouNaComunidade = false;
      this.codigoVinculo = null;
      this.abaSelecionada = 'perfil';
      this.anuncios = [];

      this.carregarTotalUsuarios(this.comunidade.cdComunidade);

      this.exibirMensagem('Você foi removido dessa comunidade.');
    });
  }

  rotuloTipoAnuncio(tipo: string): string {
    return tipo === 'REQUERIMENTO' ? 'COMPRA' : 'VENDA';
  }

  verificarUsuarioNaComunidade(cdComunidade: number) {
    this.token = this.tokenService.extrair();

    if (!this.token.cdUsuario) {
      return;
    }

    this.carregandoVinculo = true;

    this.usuarioComunidadeService.listarComunidadesPorUsuario(this.token.cdUsuario).subscribe({
      next: (vinculos) => {
        const vinculo = vinculos.find(
          (v) => v.comunidade.cdComunidade === cdComunidade
        );

        this.usuarioEntrouNaComunidade = this.usuarioEhAdmin || !!vinculo;
        this.codigoVinculo = vinculo?.codigo ?? null;
        this.carregandoVinculo = false;
      },
      error: () => {
        this.carregandoVinculo = false;
        this.exibirMensagem(
          'Erro ao verificar participação na comunidade.'
        );
      }
    });
  }

  entrarComunidade() {
    if (this.usuarioEntrouNaComunidade || this.entrandoComunidade) {
      return;
    }

    this.token = this.tokenService.extrair();

    if (!this.token.cdUsuario) {
      this.exibirMensagem('Não há usuário logado.');
      return;
    }

    this.entrandoComunidade = true;

    this.usuarioService.buscarUsuario(this.token.cdUsuario).pipe(
      switchMap((usuario: UsuarioModel) => {
        this.usuarioLogado = usuario;

        const usuarioComunidade = new UsuarioComunidadeModel();
        usuarioComunidade.usuario = usuario;
        usuarioComunidade.comunidade = this.comunidade;

        return this.usuarioComunidadeService.cadastrar(usuarioComunidade);
      })
    ).subscribe({
      next: () => {
        this.usuarioEntrouNaComunidade = true;
        this.entrandoComunidade = false;
        this.exibirMensagem('Você entrou na comunidade!');
        this.carregarTotalUsuarios(this.comunidade.cdComunidade);
      },
      error: (error: HttpErrorResponse) => {
        this.entrandoComunidade = false;
        console.error(error);

        if (error.status === 409) {
          this.usuarioEntrouNaComunidade = true;
          this.exibirMensagem('Você já participa dessa comunidade.');
          return;
        }

        this.exibirMensagem('Erro ao entrar na comunidade.');
      }
    });
  }

  async confirmarSaida() {
    if (this.usuarioEhAdmin) {
      this.exibirMensagem('O administrador não pode sair da própria comunidade.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Sair da comunidade',
      message: 'Deseja realmente sair dessa comunidade?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sair',
          role: 'destructive',
          handler: () => {
            this.sairComunidade();
          }
        }
      ]
    });

    await alert.present();
  }

  sairComunidade() {
    if (this.saindoComunidade) {
      return;
    }

    if (!this.token.cdUsuario || !this.comunidade.cdComunidade) {
      return;
    }

    this.saindoComunidade = true;

    this.usuarioComunidadeService
      .excluirRelacaoEspecifica(this.token.cdUsuario, this.comunidade.cdComunidade)
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.usuarioEntrouNaComunidade = false;
            this.codigoVinculo = null;
            this.saindoComunidade = false;
            this.abaSelecionada = 'perfil';
          });
          this.exibirMensagem('Você saiu da comunidade.');
          this.carregarTotalUsuarios(this.comunidade.cdComunidade);
        },
        error: () => {
          this.ngZone.run(() => {
            this.saindoComunidade = false;
          });
          this.exibirMensagem('Erro ao sair da comunidade.');
        }
      });
  }

  verificarUsuarioAdmin() {
    return this.comunidade.usuarioCria?.cdUsuario === this.token.cdUsuario;
  }

  async confirmarExclusao() {
    if (!this.usuarioEhAdmin) {
      this.exibirMensagem('Apenas o administrador pode excluir essa comunidade.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Excluir comunidade',
      message: 'Deseja realmente excluir essa comunidade?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.excluirComunidade();
          }
        }
      ]
    });

    await alert.present();
  }

  excluirComunidade() {
    if (!this.usuarioEhAdmin) {
      this.exibirMensagem('Apenas o administrador pode excluir essa comunidade.');
      return;
    }

    this.comunidadeService.excluir(this.comunidade.cdComunidade).subscribe({
      next: () => {
        this.exibirMensagem('Comunidade excluída com sucesso.');
        this.router.navigate(['/minhas-comunidades']);
      },
      error: () => {
        this.exibirMensagem('Erro ao excluir comunidade.');
      }
    });
  }

  selecionarAba(aba: 'perfil' | 'chat' | 'anuncios') {
    if (!this.usuarioEntrouNaComunidade && aba !== 'perfil') {
      this.exibirMensagem('Entre na comunidade para acessar esta aba.');
      return;
    }

    this.abaSelecionada = aba;

    if (
      aba === 'anuncios' &&
      this.anuncios.length === 0
    ) {

      this.carregarAnuncios();

    }

  }

  carregarAnuncios() {
    if (!this.usuarioEntrouNaComunidade) {
      return;
    }

    this.carregandoAnuncios = true;
    this.paginaAnuncios = 0;

    this.anuncioComunidadeService
      .listarAnunciosDaComunidade(
        this.comunidade.cdComunidade
      )
      .subscribe({
        next: (pagina) => {
          this.anuncios = pagina.content;
          this.ultimaPaginaAnuncios = pagina.last;
          this.carregandoAnuncios = false;
        },

        error: () => {
          this.carregandoAnuncios = false;
          this.exibirMensagem(
            'Erro ao carregar anúncios.'
          );
        }
      });

  }

  carregarMaisAnuncios() {
    if (this.carregandoMaisAnuncios || this.ultimaPaginaAnuncios) {
      return;
    }

    this.carregandoMaisAnuncios = true;

    this.anuncioComunidadeService
      .listarAnunciosDaComunidade(this.comunidade.cdComunidade, this.paginaAnuncios + 1)
      .subscribe({
        next: (pagina) => {
          this.paginaAnuncios = pagina.number;
          this.anuncios = [...this.anuncios, ...pagina.content];
          this.ultimaPaginaAnuncios = pagina.last;
          this.carregandoMaisAnuncios = false;
        },
        error: () => {
          this.carregandoMaisAnuncios = false;
          this.exibirMensagem('Erro ao carregar mais anúncios.');
        }
      });
  }

  carregarTotalUsuarios(cdComunidade: number) {
    this.usuarioComunidadeService.listarUsuariosPorComunidade(cdComunidade).subscribe({
      next: (vinculos) => {
        const lista = [...vinculos];

        const dono = this.comunidade.usuarioCria;
        if (dono && !lista.some(v => v.usuario.cdUsuario === dono.cdUsuario)) {
          const vinculoDono = new UsuarioComunidadeModel();
          vinculoDono.usuario = dono;
          vinculoDono.comunidade = this.comunidade;
          lista.unshift(vinculoDono);
        }

        lista.sort((a, b) => Number(this.ehDono(b)) - Number(this.ehDono(a)));

        this.membros = lista;
        this.totalUsuarios = lista.length;
        this.carregandoMembros = false;
      },
      error: () => {
        console.error('Erro ao carregar total de usuários da comunidade.');
        this.totalUsuarios = 0;
        this.membros = [];
        this.carregandoMembros = false;
      }
    });
  }

  get cdUsuarioLogado(): number {
    return this.token.cdUsuario;
  }

  ehDono(vinculo: UsuarioComunidadeModel): boolean {
    return vinculo.usuario.cdUsuario === this.comunidade.usuarioCria?.cdUsuario;
  }

  podeModerar(vinculo: UsuarioComunidadeModel): boolean {
    return this.usuarioEhAdmin
      && !this.ehDono(vinculo)
      && vinculo.usuario.cdUsuario !== this.cdUsuarioLogado;
  }

  abrirListaMembros() {
    if (this.membros.length === 0) {
      return;
    }
    this.mostrarMembros = true;
  }

  fecharListaMembros() {
    this.mostrarMembros = false;
    this.popoverAberto = false;
  }

  async irParaPerfilMembro(cdUsuario: number) {
    await this.modalMembros.dismiss();
    this.router.navigate(['/usuario-perfil', cdUsuario]);
  }

  abrirOpcoes(evento: Event, vinculo: UsuarioComunidadeModel) {
    this.eventoPopover = evento;
    this.membroSelecionado = vinculo;
    this.popoverAberto = true;
  }

  escolherAcao() {
    const alvo = this.membroSelecionado;
    this.popoverAberto = false;

    if (!alvo) {
      return;
    }

    this.confirmarExpulsao(alvo);
  }

  async confirmarExpulsao(vinculo: UsuarioComunidadeModel) {
    const alert = await this.alertController.create({
      header: 'Expulsar membro',
      message: `Expulsar ${vinculo.usuario.nmUsuario}? Ele será removido, mas poderá entrar de novo.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Expulsar',
          role: 'destructive',
          handler: () => {
            this.expulsarMembro(vinculo);
          }
        }
      ]
    });

    await alert.present();
  }

  private expulsarMembro(vinculo: UsuarioComunidadeModel) {
    const cdComunidade = this.comunidade.cdComunidade;
    const cdUsuario = vinculo.usuario.cdUsuario;

    // O back remove o vínculo e avisa o membro numa chamada só
    this.comunidadeService.expulsarMembro(cdComunidade, cdUsuario)
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            this.membros = this.membros.filter(m => m.usuario.cdUsuario !== cdUsuario);
            this.totalUsuarios = this.membros.length;
          });
          this.exibirMensagem('Membro expulso da comunidade.');
        },
        error: (erro: HttpErrorResponse) => {
          console.error(erro);
          this.exibirMensagem('Erro ao expulsar membro.');
          this.carregarTotalUsuarios(cdComunidade);
        }
      });
  }

  async exibirMensagem(msg: string) {
    const toast =
      await this.toastController.create({
        message: msg,
        duration: 2000,
        position: 'top'
      });
    await toast.present();
  }

}