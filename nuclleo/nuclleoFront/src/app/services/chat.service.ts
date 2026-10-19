import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { MensagemModel } from '../model/mensagem.model';
import { TokenService } from './token.service';
import { environment } from 'src/environments/environment';

interface DigitandoEvento {
  cdUsuario: number;
  digitando: boolean;
}

export interface StatusInteresseEvento {
  finalizado: boolean;
  avaliacaoInteressadoFeita: boolean;
  avaliacaoAnuncianteFeita: boolean;
  aceito: boolean;
  conversaIniciada: boolean;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  static readonly TAMANHO_PAGINA = 50;

  private readonly URL_WS = `${environment.apiUrl}/ws-chat`;
  private readonly URL_HTTP = `${environment.apiUrl}/api/v1/mensagens`;

  private client: Client | null = null;
  private mensagemRecebida = new Subject<MensagemModel>();
  private mensagemApagada = new Subject<MensagemModel>();
  private statusConexao = new Subject<boolean>();
  private digitandoEvento = new Subject<DigitandoEvento>();
  private statusInteresseAtualizado = new Subject<StatusInteresseEvento>();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  private getHeaders() {
    return { headers: this.tokenService.gerarCabecalhoAutenticacao() };
  }

  conectar(cdInteresse: number) {
    if (this.client?.active) {
      this.desconectar();
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.URL_WS),
      // O back exige o token no CONNECT e só deixa os participantes ouvirem a conversa
      connectHeaders: {
        Authorization: this.tokenService.gerarCabecalhoAutenticacao().get('Authorization') ?? ''
      },
      reconnectDelay: 5000,
      onConnect: () => {
        this.statusConexao.next(true);

        this.client!.subscribe(`/topic/chat/${cdInteresse}`, (msg: IMessage) => {
          const mensagem: MensagemModel = JSON.parse(msg.body);
          this.mensagemRecebida.next(mensagem);
        });

        this.client!.subscribe(`/topic/chat/${cdInteresse}/apagada`, (msg: IMessage) => {
          const mensagem: MensagemModel = JSON.parse(msg.body);
          this.mensagemApagada.next(mensagem);
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

  // O remetente não vai na mensagem: o back usa o usuário autenticado na conexão
  enviarMensagem(cdInteresse: number,
    mensagem: { conteudo: string; cdMensagemResposta?: number | null }) {
    if (!this.client?.active) {
      return;
    }

    this.client.publish({
      destination: `/app/chat/${cdInteresse}`,
      body: JSON.stringify(mensagem)
    });
  }

  enviarDigitando(cdInteresse: number, digitando: boolean) {
    if (!this.client?.active) {
      return;
    }

    this.client.publish({
      destination: `/app/chat/${cdInteresse}/digitando`,
      body: JSON.stringify({ digitando })
    });
  }

  onMensagemRecebida(): Observable<MensagemModel> {
    return this.mensagemRecebida.asObservable();
  }

  onMensagemApagada(): Observable<MensagemModel> {
    return this.mensagemApagada.asObservable();
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

  // "Apagar para todos": só funciona para mensagens do próprio usuário (o back confere pelo token)
  apagarMensagem(cdMensagem: number): Observable<MensagemModel> {
    return this.http.delete<MensagemModel>(`${this.URL_HTTP}/${cdMensagem}`, this.getHeaders());
  }

  // Histórico em páginas: sem "antesDe" vêm as mais recentes; com ele, as anteriores àquela mensagem
  listarHistorico(cdInteresse: number, antesDe?: number, limite = ChatService.TAMANHO_PAGINA): Observable<MensagemModel[]> {
    const params: Record<string, number> = { limite };
    if (antesDe) {
      params['antesDe'] = antesDe;
    }
    return this.http.get<MensagemModel[]>(`${this.URL_HTTP}/interesse/${cdInteresse}`, { ...this.getHeaders(), params });
  }
}
