import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonMenuButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, peopleOutline, personOutline, settingsOutline, trashOutline } from 'ionicons/icons';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AlertController, ToastController } from '@ionic/angular';
import { HttpErrorResponse } from '@angular/common/http';
import { AnuncioModel } from 'src/app/model/anuncio.model';
import { AnuncioComunidadeService } from 'src/app/services/anuncio-comunidade.service';
import { ComunidadeModel } from 'src/app/model/comunidade.model';
import { ComunidadeService } from 'src/app/services/comunidade.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UsuarioComunidadeService } from 'src/app/services/usuario-comunidade.service';
import { UsuarioComunidadeModel } from 'src/app/model/usuario-comunidade.model';

@Component({
  selector: 'app-comunidade-tela',
  templateUrl: './comunidade-tela.page.html',
  styleUrls: ['./comunidade-tela.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonButtons, IonIcon, IonMenuButton, CommonModule, FormsModule, RouterLink]
})
export class ComunidadePerfilPage implements OnInit {

  comunidade: ComunidadeModel;
  abaSelecionada: 'perfil' | 'chat' | 'anuncios' = 'perfil';
  usuarioEntrouNaComunidade = false;
  usuarioEhAdmin = false;
  carregandoVinculo = false;
  entrandoComunidade = false;
  totalUsuarios: number = 0;

  anuncios: AnuncioModel[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private comunidadeService: ComunidadeService,
    private usuarioService: UsuarioService,
    private usuarioComunidadeService: UsuarioComunidadeService,
    private anuncioComunidadeService: AnuncioComunidadeService,
    private alertController: AlertController,
    private toastController: ToastController,
  ) {
    addIcons({
      calendarOutline,
      peopleOutline,
      personOutline,
      settingsOutline,
      trashOutline
    });

    this.comunidade = new ComunidadeModel();
  }

  ngOnInit() {
  }

  ionViewWillEnter() {

    const cdComunidade = Number(this.activatedRoute.snapshot.paramMap.get('cdComunidade'));

    this.comunidadeService.buscarComunidade(cdComunidade).subscribe({
      next: (comunidade) => {
        this.comunidade = comunidade;
        this.usuarioEhAdmin = this.verificarUsuarioAdmin();
        this.usuarioEntrouNaComunidade = this.usuarioEhAdmin;
        this.verificarUsuarioNaComunidade(cdComunidade);
        this.carregarTotalUsuarios(cdComunidade);
      },
      error: () => {
        this.exibirMensagem('Erro ao carregar comunidade.');
      }
    });

    this.abaSelecionada = 'perfil';
    this.usuarioEntrouNaComunidade = false;
    this.usuarioEhAdmin = false;
    this.anuncios = [];

    this.comunidadeService.buscarComunidade(cdComunidade).subscribe({
      next: (comunidade) => {
        this.comunidade = comunidade;
        this.usuarioEhAdmin = this.verificarUsuarioAdmin();
        this.usuarioEntrouNaComunidade = this.usuarioEhAdmin;
        this.verificarUsuarioNaComunidade(cdComunidade);
      },
      error: () => {
        this.exibirMensagem(
          'Erro ao carregar comunidade.'
        );
      }
    });
  }

  verificarUsuarioNaComunidade(cdComunidade: number) {
    const usuario = this.usuarioService.getUsuarioSessao();

    if (!usuario?.cdUsuario) {
      return;
    }

    this.carregandoVinculo = true;

    this.usuarioComunidadeService.listarComunidadesPorUsuario(usuario.cdUsuario).subscribe({
      next: (vinculos) => {
        const participa = vinculos.some(
          (vinculo) => vinculo.comunidade.cdComunidade === cdComunidade
        );
        this.usuarioEntrouNaComunidade = this.usuarioEhAdmin || participa;
        this.carregandoVinculo = false;
      },
      error: () => {
        this.carregandoVinculo = false;
        this.exibirMensagem(
          'Erro ao verificar participação na comunidade.'
        );
      }
    });
  }

  entrarComunidade() {
    if (this.usuarioEntrouNaComunidade || this.entrandoComunidade) {
      return;
    }

    const usuarioComunidade = new UsuarioComunidadeModel();
    usuarioComunidade.usuario = this.usuarioService.getUsuarioSessao();
    usuarioComunidade.comunidade = this.comunidade;

    this.entrandoComunidade = true;

    this.usuarioComunidadeService.cadastrar(usuarioComunidade).subscribe({
      next: () => {
        this.usuarioEntrouNaComunidade = true;
        this.entrandoComunidade = false;
        this.exibirMensagem('Você entrou na comunidade!');
      },
      error: (error: HttpErrorResponse) => {
        this.entrandoComunidade = false;
        console.error(error);

        if (error.status === 409) {
          this.usuarioEntrouNaComunidade = true;
          this.exibirMensagem('Você já participa dessa comunidade.');
          return;
        }

        this.exibirMensagem('Erro ao entrar na comunidade.');
      }
    });

  }

  verificarUsuarioAdmin() {
    const usuario = this.usuarioService.getUsuarioSessao();
    return this.comunidade.usuarioCria?.cdUsuario === usuario.cdUsuario;
  }

  async confirmarExclusao() {
    if (!this.usuarioEhAdmin) {
      this.exibirMensagem('Apenas o administrador pode excluir essa comunidade.');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Excluir comunidade',
      message: 'Deseja realmente excluir essa comunidade?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.excluirComunidade();
          }
        }
      ]
    });

    await alert.present();
  }

  excluirComunidade() {
    if (!this.usuarioEhAdmin) {
      this.exibirMensagem('Apenas o administrador pode excluir essa comunidade.');
      return;
    }

    this.comunidadeService.excluir(this.comunidade.cdComunidade).subscribe({
      next: () => {
        this.exibirMensagem('Comunidade excluída com sucesso.');
        this.router.navigate(['/minhas-comunidades']);
      },
      error: () => {
        this.exibirMensagem('Erro ao excluir comunidade.');
      }
    });
  }

  selecionarAba(aba: 'perfil' | 'chat' | 'anuncios') {
    if (!this.usuarioEntrouNaComunidade && aba !== 'perfil') {
      this.exibirMensagem('Entre na comunidade para acessar esta aba.');
      return;
    }

    this.abaSelecionada = aba;

    if (
      aba === 'anuncios' &&
      this.anuncios.length === 0
    ) {

      this.carregarAnuncios();

    }

  }

  carregarAnuncios() {
    if (!this.usuarioEntrouNaComunidade) {
      return;
    }

    this.anuncioComunidadeService
      .listarAnunciosDaComunidade(
        this.comunidade.cdComunidade
      )
      .subscribe({
        next: (dados) => {
          this.anuncios = dados;
        },

        error: () => {
          this.exibirMensagem(
            'Erro ao carregar anúncios.'
          );
        }
      });

  }

  carregarTotalUsuarios(cdComunidade: number) {
    this.usuarioComunidadeService.listarUsuariosPorComunidade(cdComunidade).subscribe({
      next: (vinculos) => {
        this.totalUsuarios = vinculos.length;
      },
      error: () => {
        console.log("penis")
        this.totalUsuarios = 0;
      }
    });
  }

  async exibirMensagem(msg: string) {
    const toast =
      await this.toastController.create({
        message: msg,
        duration: 2000,
        position: 'top'
      });
    await toast.present();
  }

}
