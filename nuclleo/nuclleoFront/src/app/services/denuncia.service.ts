import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlertController, ToastController } from '@ionic/angular/standalone';

import { TokenService } from './token.service';
import { environment } from 'src/environments/environment';
import { MOTIVOS_DENUNCIA, TipoAlvo } from '../model/denuncia.model';

@Injectable({
  providedIn: 'root'
})
export class DenunciaService {
  private readonly API_URL = `${environment.apiUrl}/api/v1/denuncias`;
  private readonly TAMANHO_MAXIMO_DESCRICAO = 500;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  private getHeaders() {
    return { headers: this.tokenService.gerarCabecalhoAutenticacao() };
  }

  // O denunciante não vai no corpo: o back-end pega do token
  denunciar(tipoAlvo: TipoAlvo, cdAlvo: number, motivo: string, descricao: string): Observable<void> {
    return this.http.post<void>(
      this.API_URL,
      { tipoAlvo, cdAlvo, motivo, descricao: descricao || null },
      this.getHeaders()
    );
  }

  /**
   * Fluxo completo de denúncia em dois passos:
   * 1) escolher o motivo; 2) descrever (obrigatório só quando o motivo for OUTRO).
   */
  async abrirFormulario(tipoAlvo: TipoAlvo, cdAlvo: number) {
    const alertaMotivo = await this.alertController.create({
      header: tipoAlvo === 'ANUNCIO' ? 'Denunciar anúncio' : 'Denunciar usuário',
      subHeader: 'Qual é o problema?',
      inputs: MOTIVOS_DENUNCIA.map(motivo => ({
        type: 'radio' as const,
        label: motivo.rotulo,
        value: motivo.valor
      })),
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Continuar',
          handler: (motivo: string) => {
            if (!motivo) {
              this.exibirMensagem('Escolha um motivo.');
              return false;
            }
            this.abrirDescricao(tipoAlvo, cdAlvo, motivo);
            return true;
          }
        }
      ]
    });

    await alertaMotivo.present();
  }

  private async abrirDescricao(tipoAlvo: TipoAlvo, cdAlvo: number, motivo: string) {
    const descricaoObrigatoria = motivo === 'OUTRO';

    const alertaDescricao = await this.alertController.create({
      header: 'Detalhes da denúncia',
      message: descricaoObrigatoria
        ? 'Descreva o problema.'
        : 'Se quiser, conte o que aconteceu (opcional).',
      inputs: [
        {
          name: 'descricao',
          type: 'textarea',
          placeholder: 'Descreva aqui...',
          attributes: { maxlength: this.TAMANHO_MAXIMO_DESCRICAO }
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Enviar denúncia',
          role: 'destructive',
          handler: (dados) => {
            const descricao = (dados?.descricao ?? '').trim();

            if (descricaoObrigatoria && !descricao) {
              this.exibirMensagem('Descreva o problema para enviar a denúncia.');
              return false;
            }

            this.enviar(tipoAlvo, cdAlvo, motivo, descricao);
            return true;
          }
        }
      ]
    });

    await alertaDescricao.present();
  }

  private enviar(tipoAlvo: TipoAlvo, cdAlvo: number, motivo: string, descricao: string) {
    this.denunciar(tipoAlvo, cdAlvo, motivo, descricao).subscribe({
      next: () => this.exibirMensagem('Denúncia enviada. Nossa equipe vai analisar.'),
      error: (erro: any) => this.exibirMensagem(erro?.error?.message || 'Erro ao enviar denúncia.')
    });
  }

  private async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 2500,
      position: 'top'
    });
    await toast.present();
  }
}
