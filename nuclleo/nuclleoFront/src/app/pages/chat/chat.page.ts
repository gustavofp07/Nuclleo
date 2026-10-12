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
  ActionSheetController,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';

import { addIcons } from 'ionicons';
import {
  send, chatbubbleOutline, flagOutline, star, arrowUndoOutline, trashOutline, copyOutline, banOutline, close
} from 'ionicons/icons';

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
  // 'finalizar' = anunciante finalizando; 'avaliar' = interessado avaliando o anunciante
  modoTela: 'finalizar' | 'avaliar' = 'finalizar';

  // Responder e apagar mensagens
  respondendoA: MensagemView | null = null;
  mensagemDestacada: number | null = null;
  private timeoutDestaque: ReturnType<typeof setTimeout> | undefined;

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
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.token = new TokenModel();
    addIcons({
      send, chatbubbleOutline, flagOutline, star, arrowUndoOutline, trashOutline, copyOutline, banOutline, close
    });
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

    // O outro usuário (ou eu, em outro aparelho) apagou uma mensagem
    this.inscricoes.push(this.chatService.onMensagemApagada().subscribe((mensagem) => {
      this.ngZone.run(() => this.marcarComoApagada(mensagem.id!));
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

      // O alerta já avisa que o anunciante finalizou (sem toast repetindo a mesma coisa)
      if (!this.avaliacaoSolicitada) {
        this.avaliacaoSolicitada = true;
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

    const respondida = this.respondendoA;

    const mensagemOtimista: MensagemView = {
      id: Date.now(),
      cdInteresse: this.cdInteresse,
      cdUsuarioRemetente: this.token.cdUsuario,
      nomeRemetente: this.token.nmUsuario,
      conteudo: texto,
      dataEnvio: new Date().toISOString(),
      enviando: true,
      cdMensagemResposta: respondida?.id ?? null,
      nomeRemetenteResposta: respondida?.nomeRemetente ?? null,
      conteudoResposta: respondida?.conteudo ?? null
    };

    this.mensagens.push(mensagemOtimista);
    this.rolarParaFinal();

    this.chatService.enviarMensagem(
      this.cdInteresse,
      { cdUsuarioRemetente: this.token.cdUsuario, conteudo: texto, cdMensagemResposta: respondida?.id ?? null }
    );

    this.textoMensagem = '';
    this.respondendoA = null;
    this.pararDigitacao();
  }

  // ===================== RESPONDER E APAGAR =====================

  get podeInteragir(): boolean {
    return !this.chatFinalizado && !this.aguardandoAceite;
  }

  // Toque na mensagem: abre as opções (responder, copiar, apagar)
  async abrirAcoes(mensagem: MensagemView) {
    if (mensagem.enviando || mensagem.apagada) {
      return;
    }

    const minha = this.ehMinhaMensagem(mensagem);
    const botoes: any[] = [];

    if (this.podeInteragir) {
      botoes.push({ text: 'Responder', icon: 'arrow-undo-outline', handler: () => this.responder(mensagem) });
    }

    botoes.push({ text: 'Copiar texto', icon: 'copy-outline', handler: () => this.copiar(mensagem) });

    if (minha && this.podeInteragir) {
      botoes.push({
        text: 'Apagar para todos',
        icon: 'trash-outline',
        role: 'destructive',
        handler: () => { this.confirmarApagar(mensagem); }
      });
    }

    botoes.push({ text: 'Cancelar', role: 'cancel' });

    const actionSheet = await this.actionSheetController.create({ buttons: botoes });
    await actionSheet.present();
  }

  responder(mensagem: MensagemView) {
    this.respondendoA = mensagem;
  }

  cancelarResposta() {
    this.respondendoA = null;
  }

  async copiar(mensagem: MensagemView) {
    try {
      await navigator.clipboard.writeText(mensagem.conteudo ?? '');
      this.exibirMensagem('Mensagem copiada.');
    } catch {
      this.exibirMensagem('Não foi possível copiar a mensagem.');
    }
  }

  async confirmarApagar(mensagem: MensagemView) {
    const alert = await this.alertController.create({
      header: 'Apagar mensagem',
      message: 'A mensagem será apagada para você e para o outro usuário. No lugar dela vai aparecer "Mensagem apagada".',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Apagar', role: 'destructive', handler: () => this.apagar(mensagem) }
      ]
    });
    await alert.present();
  }

  apagar(mensagem: MensagemView) {
    this.chatService.apagarMensagem(mensagem.id!).subscribe({
      next: () => this.ngZone.run(() => this.marcarComoApagada(mensagem.id!)),
      error: (erro) => this.exibirMensagem(erro?.error?.message || 'Erro ao apagar a mensagem.')
    });
  }

  // Atualiza a mensagem e as respostas que citam ela
  private marcarComoApagada(cdMensagem: number) {
    for (const m of this.mensagens) {
      if (m.id === cdMensagem) {
        m.apagada = true;
        m.conteudo = null;
      }
      if (m.cdMensagemResposta === cdMensagem) {
        m.respostaApagada = true;
        m.conteudoResposta = null;
      }
    }

    if (this.respondendoA?.id === cdMensagem) {
      this.respondendoA = null;
    }
  }

  // "Você" quando a mensagem citada é minha; senão, o nome de quem enviou
  nomeDaCitacao(mensagem: MensagemView): string {
    const original = this.mensagens.find(m => m.id === mensagem.cdMensagemResposta);
    if (original && this.ehMinhaMensagem(original)) {
      return 'Você';
    }
    return mensagem.nomeRemetenteResposta ?? '';
  }

  // Toque na citação: rola até a mensagem original e destaca por um instante
  irParaMensagem(cdMensagem: number | null | undefined, event: Event) {
    event.stopPropagation();
    if (!cdMensagem) return;

    document.getElementById('msg-' + cdMensagem)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    this.mensagemDestacada = cdMensagem;
    clearTimeout(this.timeoutDestaque);
    this.timeoutDestaque = setTimeout(() => this.ngZone.run(() => this.mensagemDestacada = null), 1600);
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
    this.modoTela = 'finalizar';
    this.modalFinalizarAberto = true;
  }

  abrirTelaAvaliar() {
    this.modoTela = 'avaliar';
    this.modalFinalizarAberto = true;
  }

  aoConcluirTela() {
    this.modalFinalizarAberto = false;
    this.router.navigate(['/conversas']);
  }

  // O alerta avisa que o anunciante finalizou; a avaliação é feita na tela de estrelas
  async solicitarAvaliacaoAnunciante() {
    const alert = await this.alertController.create({
      header: 'Conversa finalizada',
      message: `${this.nomeOutroUsuario} finalizou a conversa. Avalie a negociação para concluir.`,
      backdropDismiss: false,
      buttons: [
        { text: 'Depois', role: 'cancel' },
        { text: 'Avaliar', handler: () => this.abrirTelaAvaliar() }
      ]
    });

    await alert.present();
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({ message: texto, duration: 2500, position: 'top' });
    await toast.present();
  }
}