import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonButton,
  IonSpinner,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';

import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { addIcons } from 'ionicons';
import { createOutline, trashOutline, chatbubbleOutline, personOutline, locationOutline, heartDislikeOutline, imageOutline, calendarOutline, peopleOutline, lockClosedOutline, checkmarkCircle, logInOutline, refreshOutline } from 'ionicons/icons';

import { AnuncioModel } from 'src/app/model/anuncio.model';
import { AnuncioService } from 'src/app/services/anuncio.service';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UsuarioComunidadeService } from 'src/app/services/usuario-comunidade.service';
import { UsuarioComunidadeModel } from 'src/app/model/usuario-comunidade.model';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { AnuncioComunidadeService } from 'src/app/services/anuncio-comunidade.service';
import { InteresseService } from 'src/app/services/interesse.service';
import { InteresseModel } from 'src/app/model/interesse.model';
import { TokenModel } from 'src/app/model/token.model';
import { TokenService } from 'src/app/services/token.service';
import { ComunidadeModel } from 'src/app/model/comunidade.model';
import { AnuncioComunidadeModel } from 'src/app/model/anuncio-comunidade.model';

@Component({
  selector: 'app-anuncio-tela',
  templateUrl: './anuncio-tela.page.html',
  styleUrls: ['./anuncio-tela.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonIcon,
    IonButton,
    IonSpinner
  ]
})
export class AnuncioTelaPage implements OnInit {
  token: TokenModel;

  anuncio: AnuncioModel = new AnuncioModel();
  usuarioEhDono: boolean = false;

  usuarioJaInteressado: boolean = false;
  interesseAtual: InteresseModel | null = null;
  carregandoInteresse: boolean = false;

  carregandoAnuncio: boolean = true;

  // Comunidades em que o anúncio foi publicado
  comunidadesAnuncio: ComunidadeModel[] = [];
  carregandoComunidades: boolean = false;
  erroComunidades: boolean = false;

  // Comunidades de que o usuário logado participa (usado para liberar a interação)
  comunidadesDoUsuario: Set<number> = new Set<number>();
  // Comunidade em que o usuário está entrando agora (spinner no botão)
  entrandoComunidade: number | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private anuncioService: AnuncioService,
    private interesseService: InteresseService,
    private toastController: ToastController,
    private tokenService: TokenService,
    private alertController: AlertController,
    private router: Router,
    private anuncioComunidadeService: AnuncioComunidadeService,
    private usuarioComunidadeService: UsuarioComunidadeService,
    private usuarioService: UsuarioService,
    private location: Location,
    private ngZone: NgZone,
  ) {
    this.token = new TokenModel();
    addIcons({
      createOutline,
      trashOutline,
      chatbubbleOutline,
      personOutline,
      locationOutline,
      heartDislikeOutline,
      imageOutline,
      calendarOutline,
      peopleOutline,
      lockClosedOutline,
      checkmarkCircle,
      logInOutline,
      refreshOutline,
    });
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    const possuiSessao = this.tokenService.temToken();

    if (possuiSessao) {
      this.token = this.tokenService.extrair();
    } else {
      this.router.navigate(['/login']);
      return;
    }

    const cdAnuncio = Number(
      this.activatedRoute.snapshot.paramMap.get('cdAnuncio')
    );

    this.carregandoAnuncio = true;
    this.comunidadesAnuncio = [];
    this.comunidadesDoUsuario = new Set<number>();
    this.erroComunidades = false;

    this.anuncioService.buscarAnuncio(cdAnuncio).subscribe({
      next: (anuncio) => {
        this.anuncio = anuncio;

        this.usuarioEhDono =
          this.anuncio.usuarioCria.cdUsuario === this.token.cdUsuario;

        this.carregarComunidadesDoAnuncio(this.anuncio.cdAnuncio);

        if (!this.usuarioEhDono) {
          this.verificarInteresse();
        } else {
          this.carregandoAnuncio = false;
        }
      },
      error: () => {
        this.carregandoAnuncio = false;
        this.exibirMensagem('Erro ao carregar anúncio.');
      }
    });
  }

  // Busca as comunidades onde o anúncio foi publicado e, para visitantes, em quais delas
  // o usuário já participa. Enquanto isso carrega (ou se der erro) a interação fica bloqueada.
  carregarComunidadesDoAnuncio(cdAnuncio: number) {
    this.carregandoComunidades = true;
    this.erroComunidades = false;

    forkJoin({
      relacoes: this.anuncioComunidadeService.listarRelacoesPorAnuncio(cdAnuncio),
      vinculos: this.usuarioEhDono
        ? of([] as UsuarioComunidadeModel[])
        : this.usuarioComunidadeService.listarComunidadesPorUsuario(this.token.cdUsuario)
    }).subscribe({
      next: ({ relacoes, vinculos }) => {
        this.comunidadesAnuncio = relacoes
          .map(relacao => relacao.comunidade)
          .filter(comunidade => !!comunidade);
        this.comunidadesDoUsuario = new Set(
          vinculos.map(v => v.comunidade.cdComunidade)
        );
        this.carregandoComunidades = false;
      },
      error: () => {
        this.comunidadesAnuncio = [];
        this.comunidadesDoUsuario = new Set<number>();
        this.erroComunidades = true;
        this.carregandoComunidades = false;
      }
    });
  }

  // O usuário participa dessa comunidade? (o criador da comunidade conta como participante)
  participaDe(comunidade: ComunidadeModel): boolean {
    return this.comunidadesDoUsuario.has(comunidade.cdComunidade)
      || comunidade.usuarioCria?.cdUsuario === this.token.cdUsuario;
  }

  // Só interage com o anúncio quem é o dono ou participa de ao menos uma comunidade dele
  get acessoLiberado(): boolean {
    if (this.usuarioEhDono) {
      return true;
    }
    return this.comunidadesAnuncio.some(c => this.participaDe(c));
  }

  // Entra numa comunidade direto da tela do anúncio e libera a interação
  entrarNaComunidade(comunidade: ComunidadeModel) {
    if (this.entrandoComunidade !== null || this.participaDe(comunidade)) {
      return;
    }

    this.entrandoComunidade = comunidade.cdComunidade;

    this.usuarioService.buscarUsuario(this.token.cdUsuario).pipe(
      switchMap((usuario: UsuarioModel) => {
        const usuarioComunidade = new UsuarioComunidadeModel();
        usuarioComunidade.usuario = usuario;
        usuarioComunidade.comunidade = comunidade;
        return this.usuarioComunidadeService.cadastrar(usuarioComunidade);
      })
    ).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.comunidadesDoUsuario = new Set(this.comunidadesDoUsuario).add(comunidade.cdComunidade);
          this.entrandoComunidade = null;
        });
        this.exibirMensagem(`Você entrou em ${comunidade.nmComunidade}! Agora pode interagir com o anúncio.`);
      },
      error: (erro: HttpErrorResponse) => {
        this.ngZone.run(() => {
          if (erro.status === 409) {
            // já participava (lista desatualizada): só libera
            this.comunidadesDoUsuario = new Set(this.comunidadesDoUsuario).add(comunidade.cdComunidade);
          }
          this.entrandoComunidade = null;
        });
        this.exibirMensagem(
          erro.status === 409
            ? 'Você já participa dessa comunidade.'
            : 'Erro ao entrar na comunidade.'
        );
      }
    });
  }

  irParaComunidade(cdComunidade: number) {
    this.router.navigate(['/comunidade-tela', cdComunidade]);
  }

  verificarInteresse() {
    this.interesseService.listarPorUsuario(this.token.cdUsuario).subscribe({
      next: (interesses) => {
        const interesse = interesses.find(
          i => i.anuncio.cdAnuncio === this.anuncio.cdAnuncio
        );

        this.usuarioJaInteressado = !!interesse;
        this.interesseAtual = interesse ?? null;
        this.carregandoAnuncio = false;
      },
      error: () => {
        this.carregandoAnuncio = false;
      }
    });
  }

  excluirAnuncio() {

    this.anuncioComunidadeService
      .excluirRelacoesPorAnuncio(this.anuncio.cdAnuncio)
      .subscribe({
        next: () => {

          this.anuncioService.excluirAnuncio(this.anuncio.cdAnuncio).subscribe({
            next: () => {
              this.exibirMensagem('Anúncio excluído com sucesso.');
              this.location.back();
            },
            error: () => {
              this.exibirMensagem('Erro ao excluir anúncio.');
            }
          });

        },
        error: () => {
          this.exibirMensagem('Erro ao remover anúncio das comunidades.');
        }
      });

  }

  registrarInteresse() {
    if (this.carregandoInteresse || !this.acessoLiberado) {
      return;
    }

    const interesse = {
      cdUsuario: this.token.cdUsuario,
      cdAnuncio: this.anuncio.cdAnuncio
    };

    this.carregandoInteresse = true;

    this.interesseService.registrarInteresse(interesse).subscribe({
      next: (interesseSalvo: InteresseModel) => {
        this.ngZone.run(() => {
          this.carregandoInteresse = false;
          this.usuarioJaInteressado = true;
          this.interesseAtual = interesseSalvo;
        });
        this.exibirMensagem('Interesse registrado com sucesso.');
      },
      error: (erro: any) => {
        this.ngZone.run(() => {
          this.carregandoInteresse = false;
        });
        this.exibirMensagem(
          erro?.error?.message || erro?.message || 'Erro ao registrar interesse.'
        );
      }
    });
  }

  removerInteresse() {
    if (this.carregandoInteresse || !this.interesseAtual?.id) {
      return;
    }

    this.carregandoInteresse = true;

    this.interesseService.excluirInteresse(this.interesseAtual.id).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.carregandoInteresse = false;
          this.usuarioJaInteressado = false;
          this.interesseAtual = null;
        });
        this.exibirMensagem('Interesse removido.');
      },
      error: () => {
        this.ngZone.run(() => {
          this.carregandoInteresse = false;
        });
        this.exibirMensagem('Erro ao remover interesse.');
      }
    });
  }

  // <-- ADICIONADO: agora o botão chama isso em vez de navegar direto pelo routerLink
  conversarComAnunciante() {
    if (!this.interesseAtual?.id || this.carregandoInteresse || !this.acessoLiberado) {
      return;
    }

    this.carregandoInteresse = true;

    this.interesseService.iniciarConversa(this.interesseAtual.id, this.token.cdUsuario).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.carregandoInteresse = false;
        });
        this.router.navigate(['/chat', this.interesseAtual!.id]);
      },
      error: (erro: any) => {
        this.ngZone.run(() => {
          this.carregandoInteresse = false;
        });
        this.exibirMensagem(erro?.error?.message || 'Erro ao iniciar conversa.');
      }
    });
  }

  async confirmarExclusao() {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: 'Deseja realmente excluir este anúncio?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.excluirAnuncio();
          }
        }
      ]
    });

    await alert.present();
  }

  tempoPublicacao(): string {
    if (!this.anuncio.dtCriacao) {
      return '';
    }

    const dtCriacao = new Date(this.anuncio.dtCriacao);
    const agora = new Date();

    const diffMs = agora.getTime() - dtCriacao.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDias <= 0) {
      const hora = dtCriacao.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return `Anunciado hoje às ${hora}`;
    }

    const data = dtCriacao.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return `Anunciado em ${data}`;
  }

  async confirmarInteresse() {
    if (!this.acessoLiberado) {
      return;
    }

    const alert = await this.alertController.create({
      header: this.usuarioJaInteressado ? 'Remover interesse' : 'Confirmar Interesse',
      message: this.usuarioJaInteressado
        ? 'Deseja realmente remover seu interesse neste anúncio?'
        : 'Deseja realmente manifestar interesse neste anúncio?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: this.usuarioJaInteressado ? 'Remover' : 'Confirmar',
          role: this.usuarioJaInteressado ? 'destructive' : 'confirm',
          handler: () => {
            if (this.usuarioJaInteressado) {
              this.removerInteresse();
            } else {
              this.registrarInteresse();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  irParaPerfilAnunciante() {
    const cdAnunciante = this.anuncio.usuarioCria.cdUsuario;

    if (cdAnunciante === this.token.cdUsuario) {
      this.router.navigate(['/usuario-perfil']);
    } else {
      this.router.navigate(['/usuario-perfil', cdAnunciante]);
    }
  }

  async exibirMensagem(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      position: 'top'
    });

    await toast.present();
  }
}