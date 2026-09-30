import { Component, OnInit, OnDestroy, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonFooter,
  IonItem,
  IonInput,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { sendOutline, chatbubbleOutline, flagOutline } from 'ionicons/icons';

import { ChatService, StatusInteresseEvento } from 'src/app/services/chat.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { InteresseService } from 'src/app/services/interesse.service';
import { MensagemModel } from 'src/app/model/mensagem.model';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { InteresseModel } from 'src/app/model/interesse.model';

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
    IonIcon
  ]
})
export class ChatPage implements OnInit, OnDestroy {

  @ViewChild(IonContent) content!: IonContent;

  cdInteresse!: number;
  usuarioLogado: UsuarioModel = new UsuarioModel();
  interesse: InteresseModel | null = null;

  mensagens: MensagemView[] = [];
  textoMensagem: string = '';
  conectado: boolean = false;
  nomeOutroUsuario: string = '';
  fotoOutroUsuario: string | null = null;
  outroUsuarioDigitando: boolean = false;

  souAnunciante: boolean = false;
  chatFinalizado: boolean = false;
  aguardandoAvaliacaoOutro: boolean = false;

  aguardandoAceite: boolean = false;

  private avaliacaoSolicitada = false;
  private encerrando = false;

  private timeoutDigitando: any = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private chatService: ChatService,
    private usuarioService: UsuarioService,
    private interesseService: InteresseService,
    private ngZone: NgZone,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router,
  ) {
    addIcons({ sendOutline, chatbubbleOutline, flagOutline });
  }

  ngOnInit() {
    this.usuarioLogado = this.usuarioService.getUsuarioSessao();
    this.cdInteresse = Number(this.activatedRoute.snapshot.paramMap.get('cdInteresse'));
  }

  ionViewWillEnter() {

    const possuiSessao = this.usuarioService.verificarSessao();

    if (!possuiSessao) {
      this.exibirMensagem('Não há usuário logado.');
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioLogado = this.usuarioService.getUsuarioSessao();

    if (!this.cdInteresse || isNaN(this.cdInteresse)) {
      this.router.navigate(['/nao-encontrado']);
      return;
    }

    this.avaliacaoSolicitada = false;
    this.encerrando = false;
    this.carregarInteresse();
  }

  ionViewWillLeave() {
    this.chatService.desconectar();
  }

  ngOnDestroy() {
    this.chatService.desconectar();
  }

  carregarInteresse() {
    this.interesseService.buscarPorId(this.cdInteresse).subscribe({
      next: (interesse: InteresseModel) => {

        const souEuOInteressado = interesse.usuario.cdUsuario === this.usuarioLogado.cdUsuario;
        const souEuOAnunciante = interesse.anuncio.usuarioCria.cdUsuario === this.usuarioLogado.cdUsuario;

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
          aceito: (interesse as any).aceito,
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
    this.carregarHistorico();
    this.chatService.conectar(this.cdInteresse);

    this.chatService.onMensagemRecebida().subscribe((mensagem) => {
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
    });

    this.chatService.onStatusConexao().subscribe((status) => {
      this.ngZone.run(() => {
        this.conectado = status;
      });
    });

    this.chatService.onDigitando().subscribe((evento) => {
      this.ngZone.run(() => {
        if (evento.cdUsuario !== this.usuarioLogado.cdUsuario) {
          this.outroUsuarioDigitando = evento.digitando;

          if (evento.digitando) {
            this.rolarParaFinal();
          }
        }
      });
    });

    this.chatService.onStatusInteresseAtualizado().subscribe((status) => {
      this.ngZone.run(() => {
        this.aplicarStatusInteresse(status);
      });
    });
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

    if (!texto || texto.length > 500) {
      return;
    }

    const mensagemOtimista: MensagemView = {
      id: Date.now(),
      cdInteresse: this.cdInteresse,
      cdUsuarioRemetente: this.usuarioLogado.cdUsuario,
      nomeRemetente: this.usuarioLogado.nmUsuario,
      conteudo: texto,
      dataEnvio: new Date().toISOString(),
      enviando: true
    };

    this.mensagens.push(mensagemOtimista);
    this.rolarParaFinal();

    this.chatService.enviarMensagem(
      this.cdInteresse,
      { cdUsuarioRemetente: this.usuarioLogado.cdUsuario, conteudo: texto }
    );

    this.textoMensagem = '';
    this.pararDigitacao();
  }

  onDigitar() {
    if (this.chatFinalizado || this.aguardandoAceite) {
      return;
    }

    this.chatService.enviarDigitando(this.cdInteresse, this.usuarioLogado.cdUsuario, true);

    clearTimeout(this.timeoutDigitando);
    this.timeoutDigitando = setTimeout(() => {
      this.pararDigitacao();
    }, 2000);
  }

  pararDigitacao() {
    clearTimeout(this.timeoutDigitando);
    this.chatService.enviarDigitando(this.cdInteresse, this.usuarioLogado.cdUsuario, false);
  }

  ehMinhaMensagem(mensagem: MensagemModel): boolean {
    return mensagem.cdUsuarioRemetente === this.usuarioLogado.cdUsuario;
  }

  async rolarParaFinal() {
    setTimeout(() => {
      this.content?.scrollToBottom(200);
    }, 100);
  }

  async abrirFinalizarConversa() {
    const alert = await this.alertController.create({
      header: 'Finalizar conversa',
      message: 'Deseja mesmo finalizar a conversa?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Finalizar',
          handler: () => this.abrirPerguntaTransacao()
        }
      ]
    });

    await alert.present();
  }

  async abrirPerguntaTransacao() {
    const alert = await this.alertController.create({
      header: 'Finalizar conversa',
      message: 'Ocorreu uma transação com este usuário?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Não',
          handler: () => this.solicitarAvaliacaoInteressado(false)
        },
        {
          text: 'Sim',
          handler: () => this.solicitarValorTransacao()
        }
      ]
    });

    await alert.present();
  }

  async solicitarValorTransacao() {
    const alert = await this.alertController.create({
      header: 'Valor da transação',
      backdropDismiss: false,
      inputs: [
        {
          name: 'valor',
          type: 'number',
          placeholder: 'Ex: 150.00',
          min: 0.01
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Continuar',
          handler: (dados) => {
            const valor = Number(dados.valor);
            if (!valor || valor <= 0) {
              this.exibirMensagem('Informe um valor válido.');
              return false;
            }
            this.solicitarAvaliacaoInteressado(true, valor);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async solicitarAvaliacaoInteressado(ocorreuTransacao: boolean, valor?: number) {
    const alert = await this.alertController.create({
      header: `Avalie ${this.nomeOutroUsuario}`,
      subHeader: 'De 1 a 5 estrelas',
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
          handler: (nota) => this.finalizarConversa(ocorreuTransacao, valor, nota)
        }
      ]
    });

    await alert.present();
  }

  finalizarConversa(ocorreuTransacao: boolean, valor: number | undefined, nota: number) {
    this.interesseService.finalizarConversa(this.cdInteresse, {
      cdUsuarioSolicitante: this.usuarioLogado.cdUsuario,
      ocorreuTransacao,
      valor,
      notaInteressado: nota
    }).subscribe({
      next: () => {
        this.exibirMensagem('Conversa finalizada com sucesso.');
        this.router.navigate(['/conversas']);
      },
      error: (err) => {
        this.exibirMensagem(err?.error?.message || 'Erro ao finalizar a conversa.');
      }
    });
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
      cdUsuarioSolicitante: this.usuarioLogado.cdUsuario,
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
    const toast = await this.toastController.create({ message: texto, duration: 2500 });
    toast.present();
  }
}