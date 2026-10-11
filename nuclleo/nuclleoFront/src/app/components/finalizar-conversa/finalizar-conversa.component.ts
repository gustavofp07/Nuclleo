import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonContent,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { NgxMaskDirective } from 'ngx-mask';

import { addIcons } from 'ionicons';
import { chevronBackOutline, star, starOutline } from 'ionicons/icons';

import { InteresseService } from 'src/app/services/interesse.service';
import { TokenService } from 'src/app/services/token.service';

/**
 * Tela de finalizar/avaliar conversa (usada no chat e na página de conversas).
 *
 * modo = 'finalizar' -> anunciante: informa se houve transação (e o valor) e avalia o interessado.
 * modo = 'avaliar'   -> interessado: a conversa já foi finalizada, ele só avalia o anunciante.
 *
 * Uso: <app-finalizar-conversa [aberto]="..." [modo]="..." [cdInteresse]="..." [nomeOutroUsuario]="..."
 *        (fechado)="..." (concluida)="..."></app-finalizar-conversa>
 */
@Component({
  selector: 'app-finalizar-conversa',
  templateUrl: './finalizar-conversa.component.html',
  styleUrls: ['./finalizar-conversa.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonTitle,
    IonContent,
    NgxMaskDirective
  ]
})
export class FinalizarConversaComponent implements OnChanges {
  @Input() aberto: boolean = false;
  @Input() cdInteresse!: number;
  @Input() nomeOutroUsuario: string = '';
  @Input() modo: 'finalizar' | 'avaliar' = 'finalizar';

  // Emitido quando a tela fecha sem finalizar (Voltar ou gesto de fechar)
  @Output() fechado = new EventEmitter<void>();
  // Emitido depois que o back-end confirmou (finalização ou avaliação)
  @Output() concluida = new EventEmitter<void>();

  ocorreuTransacao: boolean | null = null;
  valorTransacao: number | '' = '';
  notaAvaliacao: number = 0;
  enviandoFinalizacao: boolean = false;
  readonly estrelas = [1, 2, 3, 4, 5];
  readonly rotulosNota = ['', 'Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente'];

  // A máscara mostra "1.240,50" na tela; o modelo guarda o número 1240.5
  paraNumero = (valor: string | number | null | undefined) =>
    valor === '' || valor === null || valor === undefined ? '' : Number(valor);

  private finalizou = false;

  constructor(
    private interesseService: InteresseService,
    private tokenService: TokenService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ chevronBackOutline, star, starOutline });
  }

  // Toda vez que a tela abre, começa em branco
  ngOnChanges(changes: SimpleChanges) {
    if (changes['aberto']?.currentValue === true) {
      this.ocorreuTransacao = null;
      this.valorTransacao = '';
      this.notaAvaliacao = 0;
      this.enviandoFinalizacao = false;
      this.finalizou = false;
    }
  }

  get valorValido(): boolean {
    return typeof this.valorTransacao === 'number' && this.valorTransacao > 0 && this.valorTransacao <= 1000000;
  }

  get podeConfirmarFinalizacao(): boolean {
    if (this.notaAvaliacao < 1) return false;
    if (this.modo === 'avaliar') return true;
    if (this.ocorreuTransacao === null) return false;
    return !this.ocorreuTransacao || this.valorValido;
  }

  fecharTelaFinalizar() {
    if (this.enviandoFinalizacao) return;
    this.fechado.emit();
  }

  // Fechou por gesto/tecla (sem passar pelo Voltar): avisa o pai uma única vez.
  // Se o pai já fechou (aberto = false), não emite de novo.
  aoDispensar() {
    if (!this.finalizou && this.aberto) {
      this.fechado.emit();
    }
  }

  // A confirmação vem só no fim, já com o resumo do que será enviado
  async confirmarFinalizacao() {
    if (!this.podeConfirmarFinalizacao || this.enviandoFinalizacao) return;

    if (this.modo === 'avaliar') {
      await this.confirmarAvaliacao();
      return;
    }

    const valor = this.ocorreuTransacao ? (this.valorTransacao as number) : undefined;
    const resumoTransacao = valor !== undefined
      ? 'Transação de R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : 'Sem transação';
    const resumoNota = this.notaAvaliacao + (this.notaAvaliacao === 1 ? ' estrela' : ' estrelas');

    const alert = await this.alertController.create({
      header: 'Finalizar conversa',
      subHeader: `${resumoTransacao} · ${resumoNota}`,
      message: 'Deseja mesmo finalizar a conversa? Depois disso não dá para voltar atrás.',
      backdropDismiss: false,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Finalizar',
          handler: () => this.finalizarConversa(this.ocorreuTransacao!, valor, this.notaAvaliacao)
        }
      ]
    });

    await alert.present();
  }

  private async confirmarAvaliacao() {
    const nota = this.notaAvaliacao;

    const alert = await this.alertController.create({
      header: 'Enviar avaliação',
      subHeader: `${nota} ${nota === 1 ? 'estrela' : 'estrelas'} · ${this.rotulosNota[nota]}`,
      message: `Deseja mesmo enviar essa avaliação para ${this.nomeOutroUsuario}? Depois disso não dá para alterar.`,
      backdropDismiss: false,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Enviar', handler: () => this.avaliarAnunciante(nota) }
      ]
    });

    await alert.present();
  }

  private avaliarAnunciante(nota: number) {
    this.enviandoFinalizacao = true;

    this.interesseService.avaliarAnunciante(this.cdInteresse, {
      cdUsuarioSolicitante: this.tokenService.extrair().cdUsuario,
      nota
    }).subscribe({
      next: () => {
        this.enviandoFinalizacao = false;
        this.finalizou = true;
        this.exibirMensagem('Avaliação enviada. Obrigado!');
        this.concluida.emit();
      },
      error: (err) => {
        this.enviandoFinalizacao = false;
        this.exibirMensagem(err?.error?.message || 'Erro ao enviar avaliação.');
      }
    });
  }

  private finalizarConversa(ocorreuTransacao: boolean, valor: number | undefined, nota: number) {
    this.enviandoFinalizacao = true;

    this.interesseService.finalizarConversa(this.cdInteresse, {
      cdUsuarioSolicitante: this.tokenService.extrair().cdUsuario,
      ocorreuTransacao,
      valor,
      notaInteressado: nota
    }).subscribe({
      next: () => {
        this.enviandoFinalizacao = false;
        this.finalizou = true;
        this.exibirMensagem('Conversa finalizada com sucesso.');
        this.concluida.emit();
      },
      error: (err) => {
        this.enviandoFinalizacao = false;
        this.exibirMensagem(err?.error?.message || 'Erro ao finalizar a conversa.');
      }
    });
  }

  private async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({ message: texto, duration: 2500, position: 'top' });
    await toast.present();
  }
}
