import { Component, OnDestroy, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonFooter,
  IonInput,
  IonButton,
  IonIcon,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';

import { addIcons } from 'ionicons';
import { send, chatbubbleOutline, flagOutline } from 'ionicons/icons';

import { ChatService, StatusInteresseEvento } from 'src/app/services/chat.service';
import { InteresseService } from 'src/app/services/interesse.service';
import { MensagemModel } from 'src/app/model/mensagem.model';
import { InteresseModel } from 'src/app/model/interesse.model';
import { TokenModel } from 'src/app/model/token.model';
import { TokenService } from 'src/app/services/token.service';
import { FinalizarConversaComponent } from 'src/app/components/finalizar-conversa/finalizar-conversa.component';

interface MensagemView extends MensagemModel {
  enviando?: boolean;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonFooter,
    IonInput,
    IonButton,
    IonIcon,
    FinalizarConversaComponent
  ]
})
export class ChatPage implements OnDestroy {
  token: TokenModel;

  @ViewChild(IonContent) content!: IonContent;

  cdInteresse!: number;
  interesse: InteresseModel | null = null;

  mensagens: MensagemView[] = [];
  textoMensagem: string = '';
  readonly limiteMensagem = 500;
  conectado: boolean = false;
  nomeOutroUsuario: string = '';
  fotoOutroUsuario: string | null = null;
  outroUsuarioDigitando: boolean = false;

  souAnunciante: boolean = false;
  chatFinalizado: boolean = false;
  aguardandoAvaliacaoOutro: boolean = false;

  aguardandoAceite: boolean = false;

  // Tela de finalizar conversa (componente compartilhado com a página de conversas)
  modalFinalizarAberto: boolean = false;

  private avaliacaoSolicitada = false;
  private encerrando = false;

  private timeoutDigitando: ReturnType<typeof setTimeout> | undefined;
  private inscricoes: Subscription[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private chatService: ChatService,
    private interesseService: InteresseService,
    private ngZone: NgZone,
    private alertController: AlertController,
    private toastController: ToastController,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.token = new TokenModel();
    addIcons({ send, chatbubbleOutline, flagOutline });
  }

  ionViewWillEnter() {
    if (!this.tokenService.temToken()) {
      this.exibirMensagem('Não há usuário logado.');
      this.router.navigate(['/login']);
      return;
    }

    this.token = this.tokenService.extrair();

    this.cdInteresse = Number(this.activatedRoute.snapshot.paramMap.get('cdInteresse'));

    if (!this.cdInteresse || isNaN(this.cdInteresse)) {
      this.router.navigate(['/nao-encontrado']);
      return;
    }

    this.avaliacaoSolicitada = false;
    this.encerrando = false;
    this.carregarInteresse();
  }

  ionViewWillLeave() {
    this.encerrarChat();
  }

  ngOnDestroy() {
    this.encerrarChat();
  }

  private encerrarChat() {
    clearTimeout(this.timeoutDigitando);
    this.inscricoes.forEach(inscricao => inscricao.unsubscribe());
    this.inscricoes = [];
    this.outroUsuarioDigitando = false;
    this.chatService.desconectar();
  }

  carregarInteresse() {
    this.interesseService.buscarPorId(this.cdInteresse).subscribe({
      next: (interesse: InteresseModel) => {
        const souEuOInteressado = interesse.usuario.cdUsuario === this.token.cdUsuario;
        const souEuOAnunciante = interesse.anuncio.usuarioCria.cdUsuario === this.token.cdUsuario;

        if (!souEuOInteressado && !souEuOAnunciante) {
          this.router.navigate(['/nao-encontrado']);
          return;
        }

        if (!interesse.conversaIniciada) {
          this.router.navigate(['/nao-encontrado']);
          return;
        }

        this.interesse = interesse;

        this.nomeOutroUsuario = souEuOInteressado
          ? interesse.anuncio.usuarioCria.nmUsuario
          : interesse.usuario.nmUsuario;

        this.fotoOutroUsuario = souEuOInteressado
          ? interesse.anuncio.usuarioCria.ftUsuario
          : interesse.usuario.ftUsuario;

        this.souAnunciante = souEuOAnunciante;

        this.aplicarStatusInteresse({
          finalizado: interesse.finalizado,
          avaliacaoInteressadoFeita: interesse.avaliacaoInteressadoFeita,
          avaliacaoAnuncianteFeita: interesse.avaliacaoAnuncianteFeita,
          aceito: interesse.aceito,
          conversaIniciada: interesse.conversaIniciada
        });

        this.iniciarChat();
      },
      error: () => {
        this.router.navigate(['/nao-encontrado']);
      }
    });
  }

  iniciarChat() {
    this.encerrarChat();
    this.carregarHistorico();
    this.chatService.conectar(this.cdInteresse);

    this.inscricoes.push(this.chatService.onMensagemRecebida().subscribe((mensagem) => {
      this.ngZone.run(() => {
        const indicePendente = this.mensagens.findIndex(m =>
          m.enviando &&
          m.cdUsuarioRemetente === mensagem.cdUsuarioRemetente &&
          m.conteudo === mensagem.conteudo
        );

        if (indicePendente > -1) {
          this.mensagens[indicePendente] = mensagem;
        } else {
          this.mensagens.push(mensagem);
        }

        this.rolarParaFinal();
      });
    }));

    this.inscricoes.push(this.chatService.onStatusConexao().subscribe((status) => {
      this.ngZone.run(() => {
        this.conectado = status;
      });
    }));

    this.inscricoes.push(this.chatService.onDigitando().subscribe((evento) => {
      this.ngZone.run(() => {
        if (evento.cdUsuario !== this.token.cdUsuario) {
          this.outroUsuarioDigitando = evento.digitando;

          if (evento.digitando) {
            this.rolarParaFinal();
          }
        }
      });
    }));

    this.inscricoes.push(this.chatService.onStatusInteresseAtualizado().subscribe((status) => {
      this.ngZone.run(() => {
        this.aplicarStatusInteresse(status);
      });
    }));
  }

  private aplicarStatusInteresse(status: StatusInteresseEvento) {
    const finalizouAgora = status.finalizado && !this.chatFinalizado;

    if (!status.conversaIniciada) {
      if (!this.souAnunciante) {
        this.exibirMensagem('O anunciante recusou a solicitação de conversa.');
        this.router.navigate(['/conversas']);
      }
      return;
    }

    const aceiteRecebidoAgora = status.aceito && this.aguardandoAceite;
    this.aguardandoAceite = !this.souAnunciante && !status.aceito;

    if (aceiteRecebidoAgora) {
      this.exibirMensagem('Sua solicitação de chat foi aceita!');
    }

    this.chatFinalizado = status.finalizado;

    if (status.avaliacaoInteressadoFeita && status.avaliacaoAnuncianteFeita) {
      if (this.souAnunciante && !this.encerrando) {
        this.encerrando = true;
        this.aguardandoAvaliacaoOutro = false;
        this.exibirMensagem('O outro usuário avaliou você. Conversa concluída!');
        this.router.navigate(['/conversas']);
      }
      return;
    }

    if (!status.finalizado) {
      this.aguardandoAvaliacaoOutro = false;
      return;
    }

    if (!this.souAnunciante) {
      this.aguardandoAvaliacaoOutro = false;

      if (!this.avaliacaoSolicitada) {
        this.avaliacaoSolicitada = true;

        if (finalizouAgora) {
          this.exibirMensagem('O anunciante finalizou a conversa.');
        }

        this.solicitarAvaliacaoAnunciante();
      }
    } else {
      this.aguardandoAvaliacaoOutro = true;
    }
  }

  carregarHistorico() {
    this.chatService.listarHistorico(this.cdInteresse).subscribe({
      next: (mensagens) => {
        this.mensagens = mensagens;
        this.rolarParaFinal();
      }
    });
  }

  enviar() {
    if (this.chatFinalizado || this.aguardandoAceite) {
      return;
    }

    const texto = this.textoMensagem.trim();

    if (!texto || texto.length > this.limiteMensagem) {
      return;
    }

    const mensagemOtimista: MensagemView = {
      id: Date.now(),
      cdInteresse: this.cdInteresse,
      cdUsuarioRemetente: this.token.cdUsuario,
      nomeRemetente: this.token.nmUsuario,
      conteudo: texto,
      dataEnvio: new Date().toISOString(),
      enviando: true
    };

    this.mensagens.push(mensagemOtimista);
    this.rolarParaFinal();

    this.chatService.enviarMensagem(
      this.cdInteresse,
      { cdUsuarioRemetente: this.token.cdUsuario, conteudo: texto }
    );

    this.textoMensagem = '';
    this.pararDigitacao();
  }

  onDigitar() {
    if (this.chatFinalizado || this.aguardandoAceite) {
      return;
    }

    this.chatService.enviarDigitando(this.cdInteresse, this.token.cdUsuario, true);

    clearTimeout(this.timeoutDigitando);
    this.timeoutDigitando = setTimeout(() => {
      this.pararDigitacao();
    }, 2000);
  }

  pararDigitacao() {
    clearTimeout(this.timeoutDigitando);
    this.chatService.enviarDigitando(this.cdInteresse, this.token.cdUsuario, false);
  }

  ehMinhaMensagem(mensagem: MensagemModel): boolean {
    return mensagem.cdUsuarioRemetente === this.token.cdUsuario;
  }

  rolarParaFinal() {
    setTimeout(() => this.content?.scrollToBottom(200), 100);
  }

  abrirTelaFinalizar() {
    this.modalFinalizarAberto = true;
  }

  aoFinalizarConversa() {
    this.modalFinalizarAberto = false;
    this.router.navigate(['/conversas']);
  }

  async solicitarAvaliacaoAnunciante() {
    const alert = await this.alertController.create({
      header: 'Conversa finalizada',
      subHeader: `Avalie ${this.nomeOutroUsuario} de 1 a 5 estrelas para continuar`,
      backdropDismiss: false,
      inputs: [1, 2, 3, 4, 5].map(n => ({
        name: 'nota',
        type: 'radio' as const,
        label: '⭐'.repeat(n),
        value: n,
        checked: n === 5
      })),
      buttons: [
        {
          text: 'Confirmar',
          handler: (nota) => this.avaliarAnunciante(nota)
        }
      ]
    });

    await alert.present();
  }

  avaliarAnunciante(nota: number) {
    this.interesseService.avaliarAnunciante(this.cdInteresse, {
      cdUsuarioSolicitante: this.token.cdUsuario,
      nota
    }).subscribe({
      next: () => {
        this.exibirMensagem('Avaliação enviada. Obrigado!');
        this.router.navigate(['/conversas']);
      },
      error: (err) => {
        this.exibirMensagem(err?.error?.message || 'Erro ao enviar avaliação.');
      }
    });
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({ message: texto, duration: 2500, position: 'top' });
    await toast.present();
  }
}