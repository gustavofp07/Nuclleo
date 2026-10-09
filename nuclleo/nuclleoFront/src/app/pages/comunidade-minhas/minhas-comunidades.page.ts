import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonMenuButton,
  IonButtons,
  IonIcon,
  IonButton,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { add, peopleOutline, locationOutline, calendarOutline } from 'ionicons/icons';

import { ComunidadeModel } from 'src/app/model/comunidade.model';
import { TokenModel } from 'src/app/model/token.model';
import { ComunidadeService } from 'src/app/services/comunidade.service';
import { UsuarioComunidadeService } from 'src/app/services/usuario-comunidade.service';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-minhas-comunidades',
  templateUrl: './minhas-comunidades.page.html',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonMenuButton,
    IonButtons,
    IonIcon,
    IonButton,
    IonSpinner
  ]
})
export class MinhasComunidadesPage {
  token: TokenModel;
  comunidades: ComunidadeModel[] = [];
  carregando: boolean = true;

  constructor(
    private comunidadeService: ComunidadeService,
    private router: Router,
    private toastController: ToastController,
    private tokenService: TokenService,
    private usuarioComunidadeService: UsuarioComunidadeService
  ) {
    this.token = new TokenModel();
    addIcons({ add, peopleOutline, locationOutline, calendarOutline });
  }

  ionViewWillEnter() {
    if (!this.tokenService.temToken()) {
      this.router.navigate(['/login']);
      return;
    }

    this.token = this.tokenService.extrair();
    this.carregarComunidades();
  }

  private carregarComunidades() {
    this.carregando = true;

    forkJoin({
      vinculos: this.usuarioComunidadeService.listarComunidadesPorUsuario(this.token.cdUsuario),
      criadas: this.comunidadeService.listarComunidadesDoUsuario(this.token.cdUsuario)
    }).subscribe({
      next: ({ vinculos, criadas }) => {
        const comunidadesParticipante = vinculos.map(vinculo => vinculo.comunidade);

        this.comunidades = this.removerComunidadesDuplicadas([...criadas, ...comunidadesParticipante]);
        this.carregando = false;
      },
      error: () => {
        this.exibirMensagem('Erro ao carregar comunidades.');
        this.carregando = false;
      }
    });
  }

  private removerComunidadesDuplicadas(comunidades: ComunidadeModel[]): ComunidadeModel[] {
    const comunidadesPorId = new Map<number, ComunidadeModel>();

    comunidades.forEach(comunidade => comunidadesPorId.set(comunidade.cdComunidade, comunidade));

    return Array.from(comunidadesPorId.values());
  }

  usuarioEhAdmin(comunidade: ComunidadeModel): boolean {
    return comunidade.usuarioCria?.cdUsuario === this.token.cdUsuario;
  }

  async exibirMensagem(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 2000,
      position: 'top'
    });
    await toast.present();
  }
}
