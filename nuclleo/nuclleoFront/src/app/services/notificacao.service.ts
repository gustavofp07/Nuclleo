import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from 'src/environments/environment';
import { TokenService } from './token.service';

export interface NotificacaoEvento {
  tipo: string;
  mensagem: string;
  cdInteresse: number;
}

@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private readonly URL_WS = `${environment.apiUrl}/ws-chat`;

  private client: Client | null = null;
  private cdUsuarioConectado: number | null = null;
  private notificacaoRecebida = new Subject<NotificacaoEvento>();

  constructor(private tokenService: TokenService) { }

  conectar(cdUsuario: number, admin: boolean = false) {
    if (this.client?.active && this.cdUsuarioConectado === cdUsuario) {
      return;
    }

    this.desconectar();
    this.cdUsuarioConectado = cdUsuario;

    const repassar = (msg: IMessage) => {
      const evento: NotificacaoEvento = JSON.parse(msg.body);
      this.notificacaoRecebida.next(evento);
    };

    this.client = new Client({
      webSocketFactory: () => new SockJS(this.URL_WS),
      // O back exige o token e só entrega as notificações do próprio usuário
      // (e o canal de denúncias só para administradores)
      connectHeaders: {
        Authorization: this.tokenService.gerarCabecalhoAutenticacao().get('Authorization') ?? ''
      },
      reconnectDelay: 5000,
      onConnect: () => {
        this.client!.subscribe(`/topic/notificacoes/${cdUsuario}`, repassar);

        // Administradores também recebem o aviso de novas denúncias
        if (admin) {
          this.client!.subscribe('/topic/admin/denuncias', repassar);
        }
      }
    });

    this.client.activate();
  }

  onNotificacaoRecebida(): Observable<NotificacaoEvento> {
    return this.notificacaoRecebida.asObservable();
  }

  desconectar() {
    this.client?.deactivate();
    this.client = null;
    this.cdUsuarioConectado = null;
  }
}
