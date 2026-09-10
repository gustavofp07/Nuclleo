import {
  Component,
  OnInit
} from '@angular/core';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonMenuButton,
  IonButtons,
  IonIcon,
  IonButton,
  IonSpinner
} from '@ionic/angular/standalone';

import {
  CommonModule
} from '@angular/common';

import { forkJoin } from 'rxjs';

import {
  RouterLink
} from '@angular/router';

import {
  AlertController,
  ToastController
} from '@ionic/angular';

import {
  addIcons
} from 'ionicons';
import { add, peopleOutline, settingsOutline, trashOutline } from 'ionicons/icons';

import { ComunidadeService } from 'src/app/services/comunidade.service';
import { UsuarioModel } from 'src/app/model/usuario.model';
import { ComunidadeModel } from 'src/app/model/comunidade.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UsuarioComunidadeService } from 'src/app/services/usuario-comunidade.service';

@Component({
  selector: 'app-minhas-comunidades',
  templateUrl: './minhas-comunidades.page.html',
  styleUrls: ['./minhas-comunidades.page.scss'],
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

export class MinhasComunidadesPage implements OnInit {
  usuario: UsuarioModel;
  comunidades: ComunidadeModel[];
  carregando: boolean = true;

  constructor(
    private comunidadeService: ComunidadeService,
    private alertController: AlertController,
    private toastController: ToastController,
    private usuarioService: UsuarioService,
    private usuarioComunidadeService: UsuarioComunidadeService) {
    this.usuario = new UsuarioModel();
    this.comunidades = [];
    addIcons({
      add,
      peopleOutline,
      settingsOutline,
      trashOutline
    });
  }

  ngOnInit() {
    this.usuario = this.usuarioService.getUsuarioSessao();
    if (this.usuario) {
      this.carregarComunidades();
    }
  }

  ionViewWillEnter() {
    this.usuario = this.usuarioService.getUsuarioSessao(); // <-- ADICIONADO
    if (this.usuario) {
      this.carregarComunidades();
    }
  }

  carregarComunidades() {
    this.carregando = true;

    forkJoin({
      vinculos: this.usuarioComunidadeService.listarComunidadesPorUsuario(this.usuario.cdUsuario),
      criadas: this.comunidadeService.listarComunidadesDoUsuario(this.usuario.cdUsuario)
    }).subscribe({
      next: async ({ vinculos, criadas }) => {
        const comunidadesParticipante = vinculos.map(
          vinculo => vinculo.comunidade
        );

        this.comunidades = this.removerComunidadesDuplicadas([
          ...criadas,
          ...comunidadesParticipante
        ]);

        console.log('Comunidades carregadas: ', this.comunidades);

        this.carregando = false;

      },
      error: async () => {
        this.exibirMensagem('Erro ao carregar comunidades');
        this.carregando = false;
      }
    });

  }

  removerComunidadesDuplicadas(comunidades: ComunidadeModel[]) {
    const comunidadesPorId = new Map<number, ComunidadeModel>();

    comunidades.forEach(comunidade => {
      comunidadesPorId.set(comunidade.cdComunidade, comunidade);
    });

    return Array.from(comunidadesPorId.values());
  }

  usuarioEhAdmin(comunidade: ComunidadeModel) {
    return comunidade.usuarioCria?.cdUsuario === this.usuario.cdUsuario;
  }

  async confirmarExclusao(comunidade: ComunidadeModel) {
    const alert =
      await this.alertController.create({
        header: 'Excluir comunidade',
        message:
          'Deseja realmente excluir esta comunidade?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Excluir',
            role: 'destructive',
            handler: () => {
              this.excluirComunidade(comunidade);
            }
          }
        ]
      });
    await alert.present();
  }

  excluirComunidade(comunidade: ComunidadeModel) {
    if (!this.usuarioEhAdmin(comunidade)) {
      this.exibirMensagem('Apenas o administrador pode excluir esta comunidade.');
      return;
    }

    this.comunidadeService.excluir(comunidade.cdComunidade).subscribe({
      next: async (comunidade: ComunidadeModel) => {
        //console.log("busquei ", comunidades);
        this.exibirMensagem('Comunidade excluída com sucesso');
        this.carregarComunidades();
      },
      error: async () => {
        //console.log('Erro ao logar');
        this.exibirMensagem('Erro ao excluir comunidade.');
      }
    });

  }

  async exibirMensagem(mensagem: string) {
    const toast =
      await this.toastController.create({
        message: mensagem,
        duration: 2000,
        position: 'top'
      });
    await toast.present();
  }
}