import { Component, OnInit, OnDestroy, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

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

import { addIcons } from 'ionicons';
import { sendOutline, chatbubbleOutline } from 'ionicons/icons';

import { ChatService } from 'src/app/services/chat.service';
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
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonFooter,
    IonItem,
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
  outroUsuarioDigitando: boolean = false;

  private timeoutDigitando: any = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private chatService: ChatService,
    private usuarioService: UsuarioService,
    private interesseService: InteresseService,
    private ngZone: NgZone,
  ) {
    addIcons({ sendOutline, chatbubbleOutline });
  }

  ngOnInit() {
    this.usuarioLogado = this.usuarioService.getUsuarioSessao();
    this.cdInteresse = Number(this.activatedRoute.snapshot.paramMap.get('cdInteresse'));
  }

  ionViewWillEnter() {
    this.carregarInteresse();
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
        this.interesse = interesse;

        const souEuOInteressado = interesse.usuario.cdUsuario === this.usuarioLogado.cdUsuario;
        this.nomeOutroUsuario = souEuOInteressado
          ? interesse.anuncio.usuarioCria.nmUsuario
          : interesse.usuario.nmUsuario;
      }
    });
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
    const texto = this.textoMensagem.trim();

    if (!texto) {
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

    this.chatService.enviarMensagem(this.cdInteresse, {
      cdUsuarioRemetente: this.usuarioLogado.cdUsuario,
      conteudo: texto
    });

    this.textoMensagem = '';
    this.pararDigitacao();
  }

  onDigitar() {
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
}