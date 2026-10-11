import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonButton,
  IonSpinner,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { addIcons } from 'ionicons';
import {
  flagOutline, personOutline, pricetagOutline, timeOutline, imageOutline, trashOutline,
  banOutline, closeCircleOutline, refreshOutline, shieldCheckmarkOutline, documentTextOutline
} from 'ionicons/icons';

import { AdminService } from 'src/app/services/admin.service';
import { TokenService } from 'src/app/services/token.service';
import { DenunciaModel, SancaoModel, rotuloMotivo } from 'src/app/model/denuncia.model';

@Component({
  selector: 'app-admin-denuncia',
  templateUrl: './admin-denuncia.page.html',
  styleUrls: ['./admin-denuncia.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonButton,
    IonSpinner
  ]
})
export class AdminDenunciaPage {
  denuncia: DenunciaModel = new DenunciaModel();
  anuncio: any = null;
  usuarioDenunciado: any = null;
  sancoes: SancaoModel[] = [];
  totalDenunciasRecebidas: number = 0;

  carregando: boolean = true;
  processando: boolean = false;

  rotuloMotivo = rotuloMotivo;

  constructor(
    private activatedRoute: ActivatedRoute,
    private adminService: AdminService,
    private tokenService: TokenService,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router,
    private location: Location
  ) {
    addIcons({
      flagOutline, personOutline, pricetagOutline, timeOutline, imageOutline, trashOutline,
      banOutline, closeCircleOutline, refreshOutline, shieldCheckmarkOutline, documentTextOutline
    });
  }

  ionViewWillEnter() {
    if (!this.tokenService.isAdmin()) {
      this.router.navigate(['/login']);
      return;
    }

    this.carregar();
  }

  get cdDenuncia(): number {
    return Number(this.activatedRoute.snapshot.paramMap.get('cdDenuncia'));
  }

  get pendente(): boolean {
    return this.denuncia.status === 'PENDENTE';
  }

  get contaAtiva(): boolean {
    return this.usuarioDenunciado?.status === 'ATIVO';
  }

  get contaSuspensa(): boolean {
    return this.usuarioDenunciado?.status === 'SUSPENSO';
  }

  get anuncioDisponivel(): boolean {
    return !!this.anuncio && this.anuncio.status !== 'EXCLUIDO';
  }

  carregar() {
    this.carregando = true;

    this.adminService.buscarDenuncia(this.cdDenuncia).subscribe({
      next: (denuncia) => {
        this.denuncia = denuncia;
        this.carregarDetalhes();
      },
      error: () => {
        this.carregando = false;
        this.exibirMensagem('Denúncia não encontrada.');
        this.location.back();
      }
    });
  }

  // Dados complementares: se algum falhar, a tela continua funcionando sem ele
  carregarDetalhes() {
    const cdUsuario = this.denuncia.cdUsuarioDenunciado;

    forkJoin({
      anuncio: this.denuncia.cdAnuncio
        ? this.adminService.buscarAnuncio(this.denuncia.cdAnuncio).pipe(catchError(() => of(null)))
        : of(null),
      usuario: this.adminService.buscarUsuario(cdUsuario).pipe(catchError(() => of(null))),
      denuncias: this.adminService.listarDenunciasDoUsuario(cdUsuario).pipe(catchError(() => of([]))),
      sancoes: this.adminService.listarSancoes(cdUsuario).pipe(catchError(() => of([] as SancaoModel[])))
    }).subscribe(({ anuncio, usuario, denuncias, sancoes }) => {
      this.anuncio = anuncio;
      this.usuarioDenunciado = usuario;
      this.totalDenunciasRecebidas = denuncias.length;
      this.sancoes = sancoes;
      this.carregando = false;
    });
  }

  // ===================== AÇÕES =====================

  async confirmarExclusaoAnuncio() {
    const alert = await this.alertController.create({
      header: 'Apagar anúncio',
      message: `O anúncio "${this.denuncia.nmAnuncio}" será removido definitivamente e as conversas sobre ele serão encerradas. O anunciante será avisado.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Apagar',
          role: 'destructive',
          handler: () => this.executar(
            this.adminService.excluirAnuncio(this.denuncia.cdAnuncio!, this.denuncia.cdDenuncia),
            'Anúncio apagado.'
          )
        }
      ]
    });
    await alert.present();
  }

  async escolherDiasSuspensao() {
    const alert = await this.alertController.create({
      header: 'Suspender conta',
      subHeader: this.denuncia.nmUsuarioDenunciado,
      message: 'Durante a suspensão o usuário não consegue entrar, os anúncios dele somem e as conversas são encerradas.',
      inputs: [
        { type: 'radio', label: '1 dia', value: 1 },
        { type: 'radio', label: '3 dias', value: 3, checked: true },
        { type: 'radio', label: '7 dias', value: 7 }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Suspender',
          role: 'destructive',
          handler: (dias: number) => this.executar(
            this.adminService.suspenderUsuario(this.denuncia.cdUsuarioDenunciado, dias, this.denuncia.cdDenuncia),
            `Conta suspensa por ${dias} ${dias === 1 ? 'dia' : 'dias'}.`
          )
        }
      ]
    });
    await alert.present();
  }

  async confirmarReativacao() {
    const alert = await this.alertController.create({
      header: 'Reativar conta',
      message: `Retirar a suspensão de ${this.denuncia.nmUsuarioDenunciado} agora?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Reativar',
          handler: () => this.executar(
            this.adminService.reativarUsuario(this.denuncia.cdUsuarioDenunciado),
            'Conta reativada.'
          )
        }
      ]
    });
    await alert.present();
  }

  async confirmarDescarte() {
    const alert = await this.alertController.create({
      header: 'Descartar denúncia',
      message: 'A denúncia será marcada como improcedente e nenhuma ação será tomada.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Descartar',
          handler: () => this.executar(
            this.adminService.analisarDenuncia(this.denuncia.cdDenuncia, 'IMPROCEDENTE'),
            'Denúncia descartada.'
          )
        }
      ]
    });
    await alert.present();
  }

  async confirmarApagarDenuncia() {
    const alert = await this.alertController.create({
      header: 'Apagar denúncia',
      message: 'A denúncia sai do sistema. O histórico de sanções continua guardado.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Apagar',
          role: 'destructive',
          handler: () => {
            this.processando = true;
            this.adminService.excluirDenuncia(this.denuncia.cdDenuncia).subscribe({
              next: () => {
                this.processando = false;
                this.exibirMensagem('Denúncia apagada.');
                this.location.back();
              },
              error: (erro: any) => {
                this.processando = false;
                this.exibirMensagem(erro?.error?.message || 'Erro ao apagar denúncia.');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  private executar(acao: Observable<unknown>, sucesso: string) {
    this.processando = true;

    acao.subscribe({
      next: () => {
        this.processando = false;
        this.exibirMensagem(sucesso);
        this.carregar();
      },
      error: (erro: any) => {
        this.processando = false;
        this.exibirMensagem(erro?.error?.message || 'Não foi possível concluir a ação.');
      }
    });
  }

  // ===================== RÓTULOS =====================

  rotuloStatusDenuncia(): string {
    switch (this.denuncia.status) {
      case 'PENDENTE': return 'Pendente';
      case 'PROCEDENTE': return 'Procedente';
      default: return 'Descartada';
    }
  }

  rotuloStatusAlvo(status: string | undefined): string {
    switch (status) {
      case 'ATIVO': return 'Ativo';
      case 'SUSPENSO': return 'Suspenso';
      case 'EXCLUIDO': return 'Excluído';
      default: return '—';
    }
  }

  rotuloSancao(sancao: SancaoModel): string {
    const alvo = sancao.tipoAlvo === 'ANUNCIO' ? `Anúncio "${sancao.nmAnuncio}"` : 'Conta';

    switch (sancao.tipo) {
      case 'SUSPENSAO': return `${alvo} suspenso por ${sancao.dias} ${sancao.dias === 1 ? 'dia' : 'dias'}`;
      case 'REATIVACAO': return `${alvo} reativado`;
      default: return `${alvo} excluído`;
    }
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 2000,
      position: 'top'
    });
    await toast.present();
  }
}
