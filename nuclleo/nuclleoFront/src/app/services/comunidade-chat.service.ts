import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import { MensagemComunidadeModel } from '../model/mensagem-comunidade.model';
import { TokenService } from './token.service';
import { environment } from 'src/environments/environment';

export interface DigitandoComunidadeEvento {
  cdUsuario: number;
  nmUsuario: string;
  ftUsuario: string | null;
  digitando: boolean;
}

/**
 * Chat em grupo da comunidade.
 * Envio e exclusão vão pela API (com o token, então o back sabe quem é o remetente);
 * o WebSocket só entrega as novidades para quem está com o chat aberto.
 */
@Injectable({ providedIn: 'root' })
export class ComunidadeChatService {
  private readonly URL_WS = `${environment.apiUrl}/ws-chat`;
  private readonly URL_HTTP = `${environment.apiUrl}/api/v1/comunidades`;

  private client: Client | null = null;
  private mensagemRecebida = new Subject<MensagemComunidadeModel>();
  private mensagemApagada = new Subject<MensagemComunidadeModel>();
  private statusConexao = new Subject<boolean>();
  private digitandoEvento = new Subject<DigitandoComunidadeEvento>();
  private cdComunidadeConectada: number | null = null;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) { }

  private getHeaders() {
    return { headers: this.tokenService.gerarCabecalhoAutenticacao() };
  }

  listar(cdComunidade: number): Observable<MensagemComunidadeModel[]> {
    return this.http.get<MensagemComunidadeModel[]>(`${this.URL_HTTP}/${cdComunidade}/mensagens`, this.getHeaders());
  }

  enviar(cdComunidade: number, conteudo: string, cdMensagemResposta: number | null): Observable<MensagemComunidadeModel> {
    return this.http.post<MensagemComunidadeModel>(
      `${this.URL_HTTP}/${cdComunidade}/mensagens`,
      { conteudo, cdMensagemResposta },
      this.getHeaders()
    );
  }

  apagar(cdMensagem: number): Observable<MensagemComunidadeModel> {
    return this.http.delete<MensagemComunidadeModel>(`${this.URL_HTTP}/mensagens/${cdMensagem}`, this.getHeaders());
  }

  conectar(cdComunidade: number) {
    this.desconectar();

    this.cdComunidadeConectada = cdComunidade;

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.URL_WS),
      // O back valida o token só aqui, no CONNECT, e guarda quem é o usuário na conexão.
      // Assim o "digitando" não precisa (nem pode) dizer quem está digitando.
      connectHeaders: {
        Authorization: this.tokenService.gerarCabecalhoAutenticacao().get('Authorization') ?? ''
      },
      reconnectDelay: 5000,
      onConnect: () => {
        this.statusConexao.next(true);

        this.client!.subscribe(`/topic/comunidade/${cdComunidade}`, (msg: IMessage) => {
          this.mensagemRecebida.next(JSON.parse(msg.body));
        });

        this.client!.subscribe(`/topic/comunidade/${cdComunidade}/apagada`, (msg: IMessage) => {
          this.mensagemApagada.next(JSON.parse(msg.body));
        });

        this.client!.subscribe(`/topic/comunidade/${cdComunidade}/digitando`, (msg: IMessage) => {
          this.digitandoEvento.next(JSON.parse(msg.body));
        });
      },
      onDisconnect: () => this.statusConexao.next(false),
      onWebSocketClose: () => this.statusConexao.next(false)
    });

    this.client.activate();
  }

  // Só manda "estou digitando ou não"; quem é vem da conexão autenticada
  enviarDigitando(digitando: boolean) {
    if (!this.client?.connected || this.cdComunidadeConectada === null) {
      return;
    }

    this.client.publish({
      destination: `/app/comunidade/${this.cdComunidadeConectada}/digitando`,
      body: JSON.stringify({ digitando })
    });
  }

  desconectar() {
    this.client?.deactivate();
    this.client = null;
    this.cdComunidadeConectada = null;
  }

  onMensagemRecebida(): Observable<MensagemComunidadeModel> {
    return this.mensagemRecebida.asObservable();
  }

  onMensagemApagada(): Observable<MensagemComunidadeModel> {
    return this.mensagemApagada.asObservable();
  }

  onDigitando(): Observable<DigitandoComunidadeEvento> {
    return this.digitandoEvento.asObservable();
  }

  onStatusConexao(): Observable<boolean> {
    return this.statusConexao.asObservable();
  }
}
