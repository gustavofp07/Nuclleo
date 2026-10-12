import { Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonIcon,
  IonInput,
  IonSpinner,
  ActionSheetController,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';

import { addIcons } from 'ionicons';
import {
  send, chatbubblesOutline, arrowUndoOutline, trashOutline, copyOutline, banOutline, close, refreshOutline
} from 'ionicons/icons';

import { ComunidadeChatService } from 'src/app/services/comunidade-chat.service';
import { TokenService } from 'src/app/services/token.service';
import { MensagemComunidadeModel } from 'src/app/model/mensagem-comunidade.model';

interface MensagemView extends MensagemComunidadeModel {
  enviando?: boolean;
}

/**
 * Chat em grupo de uma comunidade (aba "Chat" da tela da comunidade).
 * Uso: <app-chat-comunidade [cdComunidade]="..." [cdCriador]="..."></app-chat-comunidade>
 */
@Component({
  selector: 'app-chat-comunidade',
  templateUrl: './chat-comunidade.component.html',
  styleUrls: ['./chat-comunidade.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonIcon, IonInput, IonSpinner]
})
export class ChatComunidadeComponent implements OnInit, OnDestroy {
  @Input() cdComunidade!: number;
  // Criador da comunidade: pode apagar qualquer mensagem (moderação)
  @Input() cdCriador: number | null = null;

  @ViewChild('lista') lista?: ElementRef<HTMLDivElement>;

  mensagens: MensagemView[] = [];
  textoMensagem: string = '';
  readonly limiteMensagem = 500;

  carregando: boolean = true;
  erroAoCarregar: boolean = false;
  conectado: boolean = false;

  respondendoA: MensagemView | null = null;
  mensagemDestacada: number | null = null;

  cdUsuarioLogado: number = 0;

  private idTemporario = -1;
  private timeoutDestaque: ReturnType<typeof setTimeout> | undefined;
  private inscricoes: Subscription[] = [];

  constructor(
    private chatService: ComunidadeChatService,
    private tokenService: TokenService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastController: ToastController,
    private ngZone: NgZone
  ) {
    addIcons({ send, chatbubblesOutline, arrowUndoOutline, trashOutline, copyOutline, banOutline, close, refreshOutline });
  }

  ngOnInit() {
    this.cdUsuarioLogado = this.tokenService.extrair().cdUsuario;
    this.carregar();

    this.chatService.conectar(this.cdComunidade);

    this.inscricoes.push(this.chatService.onMensagemRecebida().subscribe(mensagem => {
      this.ngZone.run(() => this.receber(mensagem));
    }));

    this.inscricoes.push(this.chatService.onMensagemApagada().subscribe(mensagem => {
      this.ngZone.run(() => this.marcarComoApagada(mensagem.id));
    }));

    this.inscricoes.push(this.chatService.onStatusConexao().subscribe(status => {
      this.ngZone.run(() => this.conectado = status);
    }));
  }

  ngOnDestroy() {
    clearTimeout(this.timeoutDestaque);
    this.inscricoes.forEach(i => i.unsubscribe());
    this.inscricoes = [];
    this.chatService.desconectar();
  }

  carregar() {
    this.carregando = true;
    this.erroAoCarregar = false;

    this.chatService.listar(this.cdComunidade).subscribe({
      next: (mensagens) => {
        this.mensagens = mensagens;
        this.carregando = false;
        this.rolarParaFinal(false);
      },
      error: () => {
        this.carregando = false;
        this.erroAoCarregar = true;
      }
    });
  }

  // ===================== ENVIO =====================

  enviar() {
    const texto = this.textoMensagem.trim();
    if (!texto || texto.length > this.limiteMensagem) {
      return;
    }

    const respondida = this.respondendoA;
    const token = this.tokenService.extrair();

    // Aparece na hora (meio apagada) e é trocada pela mensagem salva quando o back responder
    const pendente: MensagemView = {
      id: this.idTemporario--,
      cdComunidade: this.cdComunidade,
      cdUsuarioRemetente: token.cdUsuario,
      nomeRemetente: token.nmUsuario,
      ftRemetente: token.ftUsuario,
      conteudo: texto,
      dataEnvio: new Date().toISOString(),
      enviando: true,
      cdMensagemResposta: respondida?.id ?? null,
      nomeRemetenteResposta: respondida?.nomeRemetente ?? null,
      conteudoResposta: respondida?.conteudo ?? null
    };

    this.mensagens.push(pendente);
    this.textoMensagem = '';
    this.respondendoA = null;
    this.rolarParaFinal();

    this.chatService.enviar(this.cdComunidade, texto, respondida?.id ?? null).subscribe({
      next: (salva) => this.ngZone.run(() => this.substituirPendente(pendente.id, salva)),
      error: (erro) => this.ngZone.run(() => {
        this.mensagens = this.mensagens.filter(m => m.id !== pendente.id);
        this.textoMensagem = texto;
        this.exibirMensagem(erro?.error?.message || 'Não foi possível enviar a mensagem.');
      })
    });
  }

  // Nova mensagem pelo WebSocket (inclusive as minhas, que podem chegar antes da resposta da API)
  private receber(mensagem: MensagemComunidadeModel) {
    if (this.mensagens.some(m => m.id === mensagem.id)) {
      return;
    }

    if (mensagem.cdUsuarioRemetente === this.cdUsuarioLogado) {
      const pendente = this.mensagens.find(m => m.enviando && m.conteudo === mensagem.conteudo);
      if (pendente) {
        this.substituirPendente(pendente.id, mensagem);
        return;
      }
    }

    const estavaNoFim = this.estaNoFim();
    this.mensagens.push(mensagem);
    if (estavaNoFim) {
      this.rolarParaFinal();
    }
  }

  private substituirPendente(idPendente: number, salva: MensagemComunidadeModel) {
    const jaChegou = this.mensagens.some(m => m.id === salva.id);
    const indice = this.mensagens.findIndex(m => m.id === idPendente);

    if (indice === -1) {
      return;
    }

    if (jaChegou) {
      this.mensagens.splice(indice, 1);
    } else {
      this.mensagens[indice] = salva;
    }
  }

  // ===================== RESPONDER E APAGAR =====================

  ehMinha(mensagem: MensagemComunidadeModel): boolean {
    return mensagem.cdUsuarioRemetente === this.cdUsuarioLogado;
  }

  get souCriador(): boolean {
    return this.cdCriador !== null && this.cdCriador === this.cdUsuarioLogado;
  }

  async abrirAcoes(mensagem: MensagemView) {
    if (mensagem.enviando || mensagem.apagada) {
      return;
    }

    const botoes: any[] = [
      { text: 'Responder', icon: 'arrow-undo-outline', handler: () => { this.respondendoA = mensagem; } },
      { text: 'Copiar texto', icon: 'copy-outline', handler: () => this.copiar(mensagem) }
    ];

    if (this.ehMinha(mensagem) || this.souCriador) {
      botoes.push({
        text: this.ehMinha(mensagem) ? 'Apagar para todos' : 'Apagar (moderação)',
        icon: 'trash-outline',
        role: 'destructive',
        handler: () => { this.confirmarApagar(mensagem); }
      });
    }

    botoes.push({ text: 'Cancelar', role: 'cancel' });

    const actionSheet = await this.actionSheetController.create({ buttons: botoes });
    await actionSheet.present();
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
    const deOutraPessoa = !this.ehMinha(mensagem);

    const alert = await this.alertController.create({
      header: 'Apagar mensagem',
      message: deOutraPessoa
        ? `Como criador da comunidade, você vai apagar a mensagem de ${mensagem.nomeRemetente} para todos os membros.`
        : 'A mensagem será apagada para todos os membros. No lugar dela vai aparecer "Mensagem apagada".',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Apagar', role: 'destructive', handler: () => this.apagar(mensagem) }
      ]
    });
    await alert.present();
  }

  private apagar(mensagem: MensagemView) {
    this.chatService.apagar(mensagem.id).subscribe({
      next: () => this.ngZone.run(() => this.marcarComoApagada(mensagem.id)),
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

  nomeDaCitacao(mensagem: MensagemView): string {
    const original = this.mensagens.find(m => m.id === mensagem.cdMensagemResposta);
    if (original && this.ehMinha(original)) {
      return 'Você';
    }
    return mensagem.nomeRemetenteResposta ?? '';
  }

  irParaMensagem(cdMensagem: number | null | undefined, event: Event) {
    event.stopPropagation();
    if (!cdMensagem) return;

    const alvo = this.lista?.nativeElement.querySelector<HTMLElement>(`[data-id="${cdMensagem}"]`);
    alvo?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    this.mensagemDestacada = cdMensagem;
    clearTimeout(this.timeoutDestaque);
    this.timeoutDestaque = setTimeout(() => this.ngZone.run(() => this.mensagemDestacada = null), 1600);
  }

  // ===================== EXIBIÇÃO =====================

  // Em sequência de mensagens da mesma pessoa, nome e foto aparecem só na primeira
  mostrarRemetente(indice: number): boolean {
    const mensagem = this.mensagens[indice];
    if (this.ehMinha(mensagem)) return false;
    const anterior = this.mensagens[indice - 1];
    return !anterior || anterior.cdUsuarioRemetente !== mensagem.cdUsuarioRemetente;
  }

  // Separador de dia ("Hoje", "Ontem", "12/10/2026")
  mostrarData(indice: number): boolean {
    const atual = new Date(this.mensagens[indice].dataEnvio).toDateString();
    const anterior = this.mensagens[indice - 1];
    return !anterior || new Date(anterior.dataEnvio).toDateString() !== atual;
  }

  rotuloData(dataEnvio: string): string {
    const data = new Date(dataEnvio);
    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);

    if (data.toDateString() === hoje.toDateString()) return 'Hoje';
    if (data.toDateString() === ontem.toDateString()) return 'Ontem';
    return data.toLocaleDateString('pt-BR');
  }

  trackPorId(_: number, mensagem: MensagemView) {
    return mensagem.id;
  }

  private estaNoFim(): boolean {
    const el = this.lista?.nativeElement;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }

  private rolarParaFinal(suave: boolean = true) {
    setTimeout(() => {
      const el = this.lista?.nativeElement;
      el?.scrollTo({ top: el.scrollHeight, behavior: suave ? 'smooth' : 'auto' });
    }, 50);
  }

  private async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({ message: texto, duration: 2500, position: 'top' });
    await toast.present();
  }
}
