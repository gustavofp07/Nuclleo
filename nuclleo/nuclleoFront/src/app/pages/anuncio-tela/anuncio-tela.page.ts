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
  IonSpinner
} from '@ionic/angular/standalone';

import { ActivatedRoute, RouterLink } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';

import { addIcons } from 'ionicons';
import { createOutline, trashOutline, chatbubbleOutline, personOutline, locationOutline, heartDislikeOutline, imageOutline, calendarOutline } from 'ionicons/icons';

import { AnuncioModel } from 'src/app/model/anuncio.model';
import { AnuncioService } from 'src/app/services/anuncio.service';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { AnuncioComunidadeService } from 'src/app/services/anuncio-comunidade.service';
import { InteresseService } from 'src/app/services/interesse.service';
import { InteresseModel } from 'src/app/model/interesse.model';

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

  anuncio: AnuncioModel = new AnuncioModel();
  usuarioLogado: UsuarioModel = new UsuarioModel();
  usuarioEhDono: boolean = false;

  usuarioJaInteressado: boolean = false;
  interesseAtual: InteresseModel | null = null;
  carregandoInteresse: boolean = false;

  carregandoAnuncio: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private anuncioService: AnuncioService,
    private interesseService: InteresseService,
    private toastController: ToastController,
    private usuarioService: UsuarioService,
    private alertController: AlertController,
    private router: Router,
    private anuncioComunidadeService: AnuncioComunidadeService,
    private location: Location,
    private ngZone: NgZone,
  ) {
    addIcons({
      createOutline,
      trashOutline,
      chatbubbleOutline,
      personOutline,
      locationOutline,
      heartDislikeOutline,
      imageOutline,
      calendarOutline,
    });
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    const cdAnuncio = Number(
      this.activatedRoute.snapshot.paramMap.get('cdAnuncio')
    );

    this.carregandoAnuncio = true;

    this.anuncioService.buscarAnuncio(cdAnuncio).subscribe({
      next: (anuncio) => {
        this.anuncio = anuncio;
        this.usuarioLogado = this.usuarioService.getUsuarioSessao();
        this.usuarioEhDono =
          this.anuncio.usuarioCria.cdUsuario === this.usuarioLogado.cdUsuario;

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

  verificarInteresse() {
    this.interesseService.listarPorUsuario(this.usuarioLogado.cdUsuario).subscribe({
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
    if (this.carregandoInteresse) {
      return;
    }

    const interesse = {
      cdUsuario: this.usuarioLogado.cdUsuario,
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
        this.exibirMensagem('Erro! ' + erro.error.message);
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
    if (!this.interesseAtual?.id || this.carregandoInteresse) {
      return;
    }

    this.carregandoInteresse = true;

    this.interesseService.iniciarConversa(this.interesseAtual.id, this.usuarioLogado.cdUsuario).subscribe({
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
      return 'Anunciado hoje';
    }
    if (diffDias === 1) {
      return 'Anunciado há 1 dia';
    }
    if (diffDias < 30) {
      return `Anunciado há ${diffDias} dias`;
    }

    const diffMeses = Math.floor(diffDias / 30);
    return diffMeses === 1 ? 'Anunciado há 1 mês' : `Anunciado há ${diffMeses} meses`;
  }

  async confirmarInteresse() {
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

    if (cdAnunciante === this.usuarioLogado.cdUsuario) {
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