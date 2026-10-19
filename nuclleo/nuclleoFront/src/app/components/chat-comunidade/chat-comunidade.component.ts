import { Component, ElementRef, Input, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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

import { ComunidadeChatService, DigitandoComunidadeEvento } from 'src/app/services/comunidade-chat.service';
import { TokenService } from 'src/app/services/token.service';
import { MensagemComunidadeModel } from 'src/app/model/mensagem-comunidade.model';

interface MensagemView extends MensagemComunidadeModel {
  enviando?: boolean;
}

interface PessoaDigitando {
  cdUsuario: number;
  nome: string;
  foto: string | null;
  timeout: ReturnType<typeof setTimeout>;
}

// Enquanto a pessoa digita, o aviso é reenviado no máximo a cada 2s (e não a cada tecla)
const INTERVALO_AVISO_DIGITANDO = 2000;
// Sem tecla por 3s = parou de digitar
const PAROU_DE_DIGITAR = 3000;
// Quem recebe tira a foto se não chegar aviso novo em 5s (ex.: a pessoa fechou o app)
const EXPIRA_DIGITANDO = 5000;
// Fotos mostradas lado a lado; o resto vira "+N"
const MAXIMO_FOTOS_DIGITANDO = 3;

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
  temMensagensAnteriores = false;
  carregandoAnteriores = false;
  textoMensagem: string = '';
  readonly limiteMensagem = 500;

  carregando: boolean = true;
  erroAoCarregar: boolean = false;
  conectado: boolean = false;

  respondendoA: MensagemView | null = null;
  mensagemDestacada: number | null = null;

  cdUsuarioLogado: number = 0;

  // Quem está digitando agora (outros membros)
  digitando: PessoaDigitando[] = [];
  readonly maximoFotosDigitando = MAXIMO_FOTOS_DIGITANDO;

  private estouDigitando = false;
  private ultimoAvisoDigitando = 0;
  private timeoutPareiDeDigitar: ReturnType<typeof setTimeout> | undefined;

  private idTemporario = -1;
  private timeoutDestaque: ReturnType<typeof setTimeout> | undefined;
  private inscricoes: Subscription[] = [];

  constructor(
    private chatService: ComunidadeChatService,
    private tokenService: TokenService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastController: ToastController,
    private ngZone: NgZone,
    private router: Router
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

    this.inscricoes.push(this.chatService.onDigitando().subscribe(evento => {
      this.ngZone.run(() => this.atualizarDigitando(evento));
    }));

    this.inscricoes.push(this.chatService.onStatusConexao().subscribe(status => {
      this.ngZone.run(() => this.conectado = status);
    }));
  }

  ngOnDestroy() {
    this.pararDeDigitar();
    this.digitando.forEach(p => clearTimeout(p.timeout));
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
        this.temMensagensAnteriores = mensagens.length === ComunidadeChatService.TAMANHO_PAGINA;
        this.carregando = false;
        this.rolarParaFinal(false);
      },
      error: () => {
        this.carregando = false;
        this.erroAoCarregar = true;
      }
    });
  }

  // O histórico vem em páginas: primeiro as mais recentes, e as antigas sob demanda
  carregarAnteriores() {
    const primeira = this.mensagens.find(m => m.id);
    if (!primeira || this.carregandoAnteriores) {
      return;
    }

    this.carregandoAnteriores = true;
    this.chatService.listar(this.cdComunidade, primeira.id).subscribe({
      next: (anteriores) => {
        this.mensagens = [...anteriores, ...this.mensagens];
        this.temMensagensAnteriores = anteriores.length === ComunidadeChatService.TAMANHO_PAGINA;
        this.carregandoAnteriores = false;
        // Mantém na tela a mensagem que estava no topo
        setTimeout(() => this.lista?.nativeElement
          .querySelector<HTMLElement>(`[data-id="${primeira.id}"]`)?.scrollIntoView());
      },
      error: () => this.carregandoAnteriores = false
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
    this.pararDeDigitar();
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

    this.removerDigitando(mensagem.cdUsuarioRemetente);

    const estavaNoFim = this.estaNoFim();
    this.mensagens.push(mensagem);
    if (estavaNoFim) {
      this.rolarParaFinal();
    }
  }

  // ===================== DIGITANDO =====================

  aoDigitar() {
    clearTimeout(this.timeoutPareiDeDigitar);

    if (!this.textoMensagem.trim()) {
      this.pararDeDigitar();
      return;
    }

    const agora = Date.now();
    if (!this.estouDigitando || agora - this.ultimoAvisoDigitando >= INTERVALO_AVISO_DIGITANDO) {
      this.estouDigitando = true;
      this.ultimoAvisoDigitando = agora;
      this.chatService.enviarDigitando(true);
    }

    this.timeoutPareiDeDigitar = setTimeout(() => this.pararDeDigitar(), PAROU_DE_DIGITAR);
  }

  private pararDeDigitar() {
    clearTimeout(this.timeoutPareiDeDigitar);
    if (this.estouDigitando) {
      this.estouDigitando = false;
      this.chatService.enviarDigitando(false);
    }
  }

  private atualizarDigitando(evento: DigitandoComunidadeEvento) {
    if (evento.cdUsuario === this.cdUsuarioLogado) {
      return;
    }

    if (!evento.digitando) {
      this.removerDigitando(evento.cdUsuario);
      return;
    }

    const estavaNoFim = this.estaNoFim();
    const existente = this.digitando.find(p => p.cdUsuario === evento.cdUsuario);
    const timeout = setTimeout(
      () => this.ngZone.run(() => this.removerDigitando(evento.cdUsuario)),
      EXPIRA_DIGITANDO
    );

    if (existente) {
      clearTimeout(existente.timeout);
      existente.timeout = timeout;
    } else {
      this.digitando.push({ cdUsuario: evento.cdUsuario, nome: evento.nmUsuario, foto: evento.ftUsuario, timeout });
      if (estavaNoFim) {
        this.rolarParaFinal();
      }
    }
  }

  private removerDigitando(cdUsuario: number) {
    const pessoa = this.digitando.find(p => p.cdUsuario === cdUsuario);
    if (pessoa) {
      clearTimeout(pessoa.timeout);
      this.digitando = this.digitando.filter(p => p.cdUsuario !== cdUsuario);
    }
  }

  get textoDigitando(): string {
    const nomes = this.digitando.map(p => p.nome.split(' ')[0]);
    if (nomes.length === 1) return `${nomes[0]} está digitando`;
    if (nomes.length === 2) return `${nomes[0]} e ${nomes[1]} estão digitando`;
    return `${nomes.length} pessoas estão digitando`;
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

  // Foto ou nome de quem enviou: abre o perfil (sem abrir o menu da mensagem)
  irParaPerfil(cdUsuario: number, event?: Event) {
    event?.stopPropagation();
    this.router.navigate(['/usuario-perfil', cdUsuario]);
  }

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
