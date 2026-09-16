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

@Injectable({ providedIn: 'root' })
export class ChatService {
  //endereço do WebSocket (/ws-chat) para comunicação instantânea
  private readonly URL_WS = 'https://nuclleo.onrender.com/ws-chat';
  //endereço da API REST padrão (/api/v1/mensagens) usada para buscar coisas antigas, como o histórico
  private readonly URL_HTTP = 'https://nuclleo.onrender.com/api/v1/mensagens';

  private client: Client | null = null;
  private mensagemRecebida = new Subject<MensagemModel>();
  private statusConexao = new Subject<boolean>();
  private digitandoEvento = new Subject<DigitandoEvento>();
  private conversaFinalizada = new Subject<void>(); // <-- ADICIONADO

  constructor(private http: HttpClient) {}

  //abre a conexão em tempo real baseada em um interesse
  conectar(cdInteresse: number) {
    if (this.client?.active) {
      this.desconectar();
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.URL_WS),
      reconnectDelay: 5000,
      onConnect: () => {
        this.statusConexao.next(true);

        //escuta novas mensagens enviadas na sala. Quando chega uma, ele dá um .next(mensagem) para avisar a tela.
        this.client!.subscribe(`/topic/chat/${cdInteresse}`, (msg: IMessage) => {
          const mensagem: MensagemModel = JSON.parse(msg.body);
          this.mensagemRecebida.next(mensagem);
        });

        //Escuta o evento de outras pessoas digitando
        this.client!.subscribe(`/topic/chat/${cdInteresse}/digitando`, (msg: IMessage) => {
          const evento: DigitandoEvento = JSON.parse(msg.body);
          this.digitandoEvento.next(evento);
        });

        // <-- ADICIONADO: escuta o evento de a conversa ter sido finalizada
        this.client!.subscribe(`/topic/chat/${cdInteresse}/finalizado`, (msg: IMessage) => {
          this.conversaFinalizada.next();
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

  onConversaFinalizada(): Observable<void> { // <-- ADICIONADO
    return this.conversaFinalizada.asObservable();
  }

  desconectar() {
    this.client?.deactivate();
    this.client = null;
  }

  listarHistorico(cdInteresse: number): Observable<MensagemModel[]> {
    return this.http.get<MensagemModel[]>(`${this.URL_HTTP}/interesse/${cdInteresse}`);
  }
}