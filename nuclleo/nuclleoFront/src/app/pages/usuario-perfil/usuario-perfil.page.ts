import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonMenuButton, IonButtons, IonHeader, IonToolbar, IonTitle, IonButton, IonList, IonIcon, IonLabel, IonMenu } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  home, peopleOutline, chatbubbleOutline, personOutline, createOutline,
  locationOutline, calendarOutline, checkmarkCircleOutline, trashOutline,
  ellipseOutline, star, starHalf, starOutline, cashOutline
} from 'ionicons/icons';

import { UsuarioModel } from 'src/app/model/usuario.model';
import { UsuarioService } from 'src/app/services/usuario.service';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { AnuncioModel } from 'src/app/model/anuncio.model';
import { AnuncioService } from 'src/app/services/anuncio.service';

import { UsuarioComunidadeService } from 'src/app/services/usuario-comunidade.service';
import { AlertController } from '@ionic/angular';

import { AvaliacaoService } from 'src/app/services/avaliacao.service';

@Component({
  selector: 'app-usuario-perfil',
  templateUrl: './usuario-perfil.page.html',
  styleUrls: ['./usuario-perfil.page.scss'],
  standalone: true,
  imports: [IonContent, IonMenuButton, IonButtons, IonHeader, IonToolbar, IonTitle, IonButton, IonIcon, IonMenu, IonList, IonLabel, CommonModule, FormsModule, RouterLink]
})
export class UsuarioPerfilPage implements OnInit {

  usuario: UsuarioModel;
  anuncios: AnuncioModel[] = [];
  nivelCadastro: number = 1;
  ehPerfilProprio: boolean = true;

  mediaAvaliacao: number = 0;
  estrelasArray = [1, 2, 3, 4, 5];

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController,
    private alertController: AlertController,
    private anuncioService: AnuncioService,
    private usuarioComunidadeService: UsuarioComunidadeService,
    private avaliacaoService: AvaliacaoService,
  ) {
    addIcons({
      home, peopleOutline, chatbubbleOutline, personOutline,
      createOutline, locationOutline, calendarOutline,
      checkmarkCircleOutline, trashOutline, ellipseOutline,
      star, starHalf, starOutline, cashOutline
    });

    this.usuario = new UsuarioModel();
  }

  ngOnInit() { }

  ionViewWillEnter() {
    const cdUsuarioParam = this.activatedRoute.snapshot.paramMap.get('cdUsuario');

    if (cdUsuarioParam) {
      this.ehPerfilProprio = false;
      this.carregarUsuarioPorId(Number(cdUsuarioParam));
      return;
    }

    this.ehPerfilProprio = true;

    let aux = this.usuarioService.verificarSessao();
    if (aux == false) {
      this.router.navigate(['/login']);
    } else {
      let usuarioLogado: UsuarioModel = this.usuarioService.getUsuarioSessao();
      this.carregarUsuarioPorId(usuarioLogado.cdUsuario);
    }
  }

  carregarUsuarioPorId(cdUsuario: number) {
    this.usuarioService.buscarUsuario(cdUsuario).subscribe({
      next: async (usuario: UsuarioModel) => {
        this.usuario = usuario;
        this.calcularNivelCadastro();
        this.carregarAnunciosUsuario();
        this.carregarAvaliacao();
      },
      error: async () => {
        console.log('Erro ao buscar usuário.');
        this.exibirMensagem('Erro ao carregar perfil.');
      }
    });
  }

  carregarAvaliacao() {
    this.avaliacaoService.media(this.usuario.cdUsuario).subscribe({
      next: (media) => this.mediaAvaliacao = media ?? 0,
      error: () => this.mediaAvaliacao = 0
    });
  }

  calcularNivelCadastro() {
    const temCpf = !!this.usuario.cpf?.trim();
    const temTelefone = !!this.usuario.telefone?.trim();

    if (temCpf && temTelefone) {
      this.nivelCadastro = 3;
    } else if (temCpf || temTelefone) {
      this.nivelCadastro = 2;
    } else {
      this.nivelCadastro = 1;
    }
  }

  async confirmarExclusao() {
    const alert = await this.alertController.create({
      header: 'Excluir perfil',
      message: 'Essa ação é permanente. Digite sua senha para confirmar a exclusão do seu perfil.',
      inputs: [
        {
          name: 'senha',
          type: 'password',
          placeholder: 'Senha'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: (dados) => {
            if (!dados.senha) {
              this.exibirMensagem('Digite sua senha para confirmar.');
              return false;
            }
            this.validarSenhaEExcluir(dados.senha);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  validarSenhaEExcluir(senha: string) {
    const usuarioLogado: UsuarioModel = this.usuarioService.getUsuarioSessao();

    this.usuarioService.autenticar({ email: usuarioLogado.email, senha }).subscribe({
      next: () => {
        this.excluir();
      },
      error: () => {
        this.exibirMensagem('Senha incorreta.');
      }
    });
  }

  excluir() {
    const usuarioLogado: UsuarioModel = this.usuarioService.getUsuarioSessao();

    this.usuarioComunidadeService.excluirPorUsuario(usuarioLogado.cdUsuario).subscribe({
      next: () => {
        this.usuarioService.excluirUsuario(usuarioLogado.cdUsuario).subscribe({
          next: () => {
            this.usuarioService.limparSessao();
            this.router.navigate(['/login']);
          },
          error: () => {
            this.exibirMensagem('Erro ao excluir o usuário.');
          }
        });
      },
      error: () => {
        this.exibirMensagem('Erro ao remover usuário das comunidades.');
      }
    });
  }

  carregarAnunciosUsuario() {
    this.anuncioService.listarAnunciosPorUsuario(this.usuario.cdUsuario).subscribe({
      next: (dados) => {
        this.anuncios = dados;
      },
      error: () => {
        console.error('Erro ao carregar anúncios do usuário.');
      }
    });
  }

  async exibirMensagem(texto: string) {
    const toast = await this.toastController.create({
      message: texto,
      duration: 2000
    });
    toast.present();
  }

}