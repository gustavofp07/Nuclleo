import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import {
  IonContent,
  IonInput,
  IonItem,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  ToastController
} from '@ionic/angular/standalone';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UsuarioService } from 'src/app/services/usuario.service';
import { AnuncioService } from 'src/app/services/anuncio.service';

@Component({
  selector: 'app-criar-anuncio',
  templateUrl: './criar-anuncio.page.html',
  styleUrls: ['./criar-anuncio.page.scss'],
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,

    IonContent,
    IonInput,
    IonItem,
    IonButton,

    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton
  ]
})
export class CriarAnuncioPage {

  tipo = '';

  nmAnuncio = '';
  descricao = '';

  valor = 0;

  valorMin = 0;
  valorMax = 0;

  imagemSelecionada?: File;
  previewImagem?: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private anuncioService: AnuncioService,
    private usuarioService: UsuarioService,
    private toastController: ToastController,
    private router: Router
  ) {}

  ngOnInit() {

    this.tipo =
      this.activatedRoute.snapshot.paramMap
        .get('tipo')
        ?.toUpperCase() || '';

  }

  selecionarImagem(event: any) {

    const arquivo = event.target.files[0];

    if (!arquivo) {
      return;
    }

    const tiposPermitidos = [
      'image/png',
      'image/jpeg'
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {

      this.exibirMensagem(
        'Selecione apenas imagens PNG ou JPG.'
      );

      return;
    }

    this.imagemSelecionada = arquivo;

    const reader = new FileReader();

    reader.onload = () => {

      this.previewImagem =
        reader.result as string;

    };

    reader.readAsDataURL(arquivo);

  }

  salvar() {

    if (this.tipo === 'VENDA') {
      this.cadastrarVenda();
    }
    else {
      this.cadastrarRequerimento();
    }

  }

  cadastrarVenda() {

    const anuncio = {

      nmAnuncio: this.nmAnuncio,

      descricao: this.descricao,

      ftAnuncio: '',

      valor: this.valor,

      tipoAnuncio: 'VENDA',

      usuarioCria:
        this.usuarioService.getUsuarioSessao()

    };

    this.anuncioService
      .cadastrarVenda(anuncio)
      .subscribe({

        next: () => {

          this.exibirMensagem(
            'Anúncio criado com sucesso!'
          );

          this.router.navigate([
            '/tela-inicial'
          ]);

        },

        error: () => {

          this.exibirMensagem(
            'Erro ao criar anúncio.'
          );

        }

      });

  }

  cadastrarRequerimento() {

    const anuncio = {

      nmAnuncio: this.nmAnuncio,

      descricao: this.descricao,

      ftAnuncio: '',

      valorMin: this.valorMin,

      valorMax: this.valorMax,

      tipoAnuncio: 'REQUERIMENTO',

      usuarioCria:
        this.usuarioService.getUsuarioSessao()

    };

    this.anuncioService
      .cadastrarRequerimento(anuncio)
      .subscribe({

        next: () => {

          this.exibirMensagem(
            'Requerimento criado com sucesso!'
          );

          this.router.navigate([
            '/tela-inicial'
          ]);

        },

        error: () => {

          this.exibirMensagem(
            'Erro ao criar requerimento.'
          );

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