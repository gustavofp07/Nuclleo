import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
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
import { sendOutline } from 'ionicons/icons';

import { ChatService } from 'src/app/services/chat.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { InteresseService } from 'src/app/services/interesse.service';
import { MensagemModel } from 'src/app/model/mensagem.model';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { InteresseModel } from 'src/app/model/interesse.model';

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

  mensagens: MensagemModel[] = [];
  textoMensagem: string = '';
  conectado: boolean = false;
  nomeOutroUsuario: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private chatService: ChatService,
    private usuarioService: UsuarioService,
    private interesseService: InteresseService,
  ) {
    addIcons({ sendOutline });
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
      this.mensagens.push(mensagem);
      this.rolarParaFinal();
    });

    this.chatService.onStatusConexao().subscribe((status) => {
      this.conectado = status;
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

    this.chatService.enviarMensagem(this.cdInteresse, {
      cdUsuarioRemetente: this.usuarioLogado.cdUsuario,
      conteudo: texto
    });

    this.textoMensagem = '';
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