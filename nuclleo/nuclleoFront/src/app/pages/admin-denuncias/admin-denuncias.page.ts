import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonButton,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  ToastController
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';

import { addIcons } from 'ionicons';
import { flagOutline, personOutline, pricetagOutline, timeOutline, chevronForwardOutline } from 'ionicons/icons';

import { AdminService } from 'src/app/services/admin.service';
import { TokenService } from 'src/app/services/token.service';
import { NotificacaoService } from 'src/app/services/notificacao.service';
import { DenunciaModel, StatusDenuncia, TipoAlvo, rotuloMotivo } from 'src/app/model/denuncia.model';

@Component({
  selector: 'app-admin-denuncias',
  templateUrl: './admin-denuncias.page.html',
  styleUrls: ['./admin-denuncias.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonIcon,
    IonButton,
    IonSpinner,
    IonRefresher,
    IonRefresherContent
  ]
})
export class AdminDenunciasPage implements OnDestroy {
  denuncias: DenunciaModel[] = [];
  statusSelecionado: StatusDenuncia | null = 'PENDENTE';
  tipoAlvoSelecionado: TipoAlvo | null = null;

  pagina: number = 0;
  ultimaPagina: boolean = true;
  totalDenuncias: number = 0;

  carregando: boolean = false;
  carregandoMais: boolean = false;

  rotuloMotivo = rotuloMotivo;

  private notificacaoSub?: Subscription;

  constructor(
    private adminService: AdminService,
    private tokenService: TokenService,
    private notificacaoService: NotificacaoService,
    private toastController: ToastController,
    private router: Router
  ) {
    addIcons({ flagOutline, personOutline, pricetagOutline, timeOutline, chevronForwardOutline });
  }

  ionViewWillEnter() {
    if (!this.tokenService.isAdmin()) {
      this.router.navigate(['/login']);
      return;
    }

    this.carregar();

    // Nova denúncia chegando com a tela aberta: recarrega a lista de pendentes
    this.notificacaoSub?.unsubscribe();
    this.notificacaoSub = this.notificacaoService.onNotificacaoRecebida().subscribe(evento => {
      if (evento.tipo === 'NOVA_DENUNCIA' && this.statusSelecionado !== 'IMPROCEDENTE'
        && this.statusSelecionado !== 'PROCEDENTE') {
        this.carregar();
      }
    });
  }

  ionViewWillLeave() {
    this.notificacaoSub?.unsubscribe();
  }

  ngOnDestroy() {
    this.notificacaoSub?.unsubscribe();
  }

  selecionarStatus(status: StatusDenuncia | null) {
    if (this.statusSelecionado === status) return;
    this.statusSelecionado = status;
    this.carregar();
  }

  selecionarTipoAlvo(tipoAlvo: TipoAlvo | null) {
    this.tipoAlvoSelecionado = this.tipoAlvoSelecionado === tipoAlvo ? null : tipoAlvo;
    this.carregar();
  }

  carregar(evento?: any) {
    this.carregando = !evento;
    this.pagina = 0;

    this.adminService.listarDenuncias(this.statusSelecionado, this.tipoAlvoSelecionado, 0).subscribe({
      next: (pagina) => {
        this.denuncias = pagina.content;
        this.ultimaPagina = pagina.last;
        this.totalDenuncias = pagina.totalElements;
        this.carregando = false;
        evento?.target?.complete();
      },
      error: () => {
        this.denuncias = [];
        this.carregando = false;
        evento?.target?.complete();
        this.exibirMensagem('Erro ao carregar denúncias.');
      }
    });
  }

  carregarMais() {
    if (this.carregandoMais || this.ultimaPagina) return;

    this.carregandoMais = true;

    this.adminService.listarDenuncias(this.statusSelecionado, this.tipoAlvoSelecionado, this.pagina + 1).subscribe({
      next: (pagina) => {
        this.pagina = pagina.number;
        this.denuncias = [...this.denuncias, ...pagina.content];
        this.ultimaPagina = pagina.last;
        this.carregandoMais = false;
      },
      error: () => {
        this.carregandoMais = false;
        this.exibirMensagem('Erro ao carregar mais denúncias.');
      }
    });
  }

  rotuloStatus(status: StatusDenuncia): string {
    switch (status) {
      case 'PENDENTE': return 'Pendente';
      case 'PROCEDENTE': return 'Procedente';
      case 'IMPROCEDENTE': return 'Descartada';
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
