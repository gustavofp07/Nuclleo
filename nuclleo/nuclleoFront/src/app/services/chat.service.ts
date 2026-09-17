import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { MensagemModel } from '../model/mensagem.model';

interface DigitandoEvento {
  cdUsuario: number;
  digitando: boolean;
}

export interface StatusInteresseEvento {
  finalizado: boolean;
  avaliacaoInteressadoFeita: boolean; 
  avaliacaoAnuncianteFeita: boolean; 
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly URL_WS = 'https://nuclleo.onrender.com/ws-chat';
  private readonly URL_HTTP = 'https://nuclleo.onrender.com/api/v1/mensagens';

  private client: Client | null = null;
  private mensagemRecebida = new Subject<MensagemModel>();
  private statusConexao = new Subject<boolean>();
  private digitandoEvento = new Subject<DigitandoEvento>();
  private statusInteresseAtualizado = new Subject<StatusInteresseEvento>();

  constructor(private http: HttpClient) {}

  conectar(cdInteresse: number) {
    if (this.client?.active) {
      this.desconectar();
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.URL_WS),
      reconnectDelay: 5000,
      onConnect: () => {
        this.statusConexao.next(true);

        this.client!.subscribe(`/topic/chat/${cdInteresse}`, (msg: IMessage) => {
          const mensagem: MensagemModel = JSON.parse(msg.body);
          this.mensagemRecebida.next(mensagem);
        });

        this.client!.subscribe(`/topic/chat/${cdInteresse}/digitando`, (msg: IMessage) => {
          const evento: DigitandoEvento = JSON.parse(msg.body);
          this.digitandoEvento.next(evento);
        });

        this.client!.subscribe(`/topic/chat/${cdInteresse}/status`, (msg: IMessage) => {
          const status: StatusInteresseEvento = JSON.parse(msg.body);
          this.statusInteresseAtualizado.next(status);
        });
      },
      onDisconnect: () => {
        this.statusConexao.next(false);
      },
      onWebSocketClose: () => {
        this.statusConexao.next(false);
      }
    });

    this.client.activate();
  }

  enviarMensagem(cdInteresse: number, mensagem: { cdUsuarioRemetente: number; conteudo: string }) {
    if (!this.client?.active) {
      return;
    }

    this.client.publish({
      destination: `/app/chat/${cdInteresse}`,
      body: JSON.stringify(mensagem)
    });
  }

  enviarDigitando(cdInteresse: number, cdUsuario: number, digitando: boolean) {
    if (!this.client?.active) {
      return;
    }

    this.client.publish({
      destination: `/app/chat/${cdInteresse}/digitando`,
      body: JSON.stringify({ cdUsuario, digitando })
    });
  }

  onMensagemRecebida(): Observable<MensagemModel> {
    return this.mensagemRecebida.asObservable();
  }

  onStatusConexao(): Observable<boolean> {
    return this.statusConexao.asObservable();
  }

  onDigitando(): Observable<DigitandoEvento> {
    return this.digitandoEvento.asObservable();
  }

  onStatusInteresseAtualizado(): Observable<StatusInteresseEvento> {
    return this.statusInteresseAtualizado.asObservable();
  }

  desconectar() {
    this.client?.deactivate();
    this.client = null;
  }

  listarHistorico(cdInteresse: number): Observable<MensagemModel[]> {
    return this.http.get<MensagemModel[]>(`${this.URL_HTTP}/interesse/${cdInteresse}`);
  }
}