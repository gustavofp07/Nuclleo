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
  ToastController,
  IonList,
  IonCheckbox,
  IonLabel,
  IonTextarea,
  ActionSheetController
} from '@ionic/angular/standalone';

import { CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import { cameraOutline, imageOutline } from 'ionicons/icons';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UsuarioService } from 'src/app/services/usuario.service';
import { AnuncioService } from 'src/app/services/anuncio.service';
import { ComunidadeModel } from 'src/app/model/comunidade.model';
import { UsuarioComunidadeService } from 'src/app/services/usuario-comunidade.service';
import { AnuncioVendaModel } from 'src/app/model/anuncio-venda.model';
import { AnuncioRequerimentoModel } from 'src/app/model/anuncio-requerimento.model';
import { AnuncioModel } from 'src/app/model/anuncio.model';
import { AnuncioComunidadeService } from 'src/app/services/anuncio-comunidade.service';
import { ArquivoService } from 'src/app/services/arquivo.service';

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
    IonTextarea,

    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonList,
    IonCheckbox,
    IonLabel
  ]
})
export class CriarAnuncioPage {
  anuncio!: AnuncioModel;

  tipo = '';
  limiteDescricao: number = 250;

  usuarioEhDono: boolean = false;

  cdAnuncioEdicao: number = 0;
  modoEdicao: boolean = false;

  comunidadesSelecionadas: ComunidadeModel[];
  comunidades: ComunidadeModel[];

  previewFoto: string | ArrayBuffer | null = null;
  imagemSelecionada?: File;

  constructor(
    private activatedRoute: ActivatedRoute,
    private anuncioService: AnuncioService,
    private usuarioService: UsuarioService,
    private usuarioComunidadeService: UsuarioComunidadeService,
    private anuncioComunidadeService: AnuncioComunidadeService,
    private arquivoService: ArquivoService,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private router: Router
  ) {

    addIcons({
      cameraOutline,
      imageOutline
    });

    //this.anuncioVenda = new AnuncioVendaModel();
    //this.anuncioRequerimento = new AnuncioRequerimentoModel();

    this.comunidades = [];
    this.comunidadesSelecionadas = [];
  }

  ngOnInit() {

    this.tipo = this.activatedRoute.snapshot.paramMap.get('tipo')?.toUpperCase() || '';
    this.cdAnuncioEdicao = Number(this.activatedRoute.snapshot.paramMap.get('cdAnuncio'));

    if (this.tipo === 'VENDA') {
      this.anuncio = new AnuncioVendaModel();
    } else {
      this.anuncio = new AnuncioRequerimentoModel();
    }

    if (this.cdAnuncioEdicao > 0) {
      this.modoEdicao = true;
      this.carregarAnuncioParaEditar();
    }

    this.carregarComunidadesUsuario();
  }

  ionViewWillEnter() {
    this.previewFoto = null;
    this.imagemSelecionada = undefined;
    this.comunidadesSelecionadas = [];
  }

  carregarComunidadesUsuario() {
    const usuario = this.usuarioService.getUsuarioSessao();

    this.usuarioComunidadeService.listarComunidadesPorUsuario(usuario.cdUsuario).subscribe({
      next: (relacoes) => {
        //olhar o funcionamento desse retorno aqui
        this.comunidades = relacoes.map(relacao => relacao.comunidade);
      },
      error: () => {
        this.exibirMensagem('Erro ao carregar comunidades.');
      }
    });
  }

  alterarSelecao(comunidade: ComunidadeModel, marcado: boolean) {
    if (marcado) {
      const jaExiste = this.comunidadesSelecionadas.some(
        c => c.cdComunidade === comunidade.cdComunidade
      );

      if (!jaExiste) {
        this.comunidadesSelecionadas.push(comunidade);
      }
    } else {
      this.comunidadesSelecionadas =
        this.comunidadesSelecionadas.filter(
          c => c.cdComunidade !== comunidade.cdComunidade
        );
    }
  }

  async selecionarImagem() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Foto',
      buttons: [
        {
          text: 'Câmera',
          icon: 'camera-outline',
          handler: () => this.capturarImagem(CameraSource.Camera)
        },
        {
          text: 'Galeria',
          icon: 'image-outline',
          handler: () => this.capturarImagem(CameraSource.Photos)
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  private async capturarImagem(source: CameraSource) {
    const arquivo = await this.arquivoService.capturar(source);

    if (!arquivo) {
      return;
    }

    const tiposPermitidos = [
      'image/jpeg',
      'image/png'
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
      await this.exibirMensagem('Selecione apenas imagens JPG, JPEG ou PNG.');
      return;
    }

    this.imagemSelecionada = arquivo;

    const reader = new FileReader();

    reader.onload = () => {
      this.previewFoto = reader.result;
    };

    reader.readAsDataURL(arquivo);
  }

  salvar() {

    this.anuncio.usuarioCria = this.usuarioService.getUsuarioSessao();
    this.anuncio.tipoAnuncio = this.tipo;

    if (this.modoEdicao) {

      if (this.tipo === 'VENDA') {

        this.anuncioService.alterarVenda(
          this.anuncio as AnuncioVendaModel,
          this.imagemSelecionada
        ).subscribe({
          next: () => {
            this.atualizarComunidadesDoAnuncio();
          },
          error: () => {
            this.exibirMensagem('Erro ao alterar anúncio.');
          }
        });

      } else {

        this.anuncioService.alterarRequerimento(
          this.anuncio as AnuncioRequerimentoModel,
          this.imagemSelecionada
        ).subscribe({
          next: () => {
            this.atualizarComunidadesDoAnuncio();
          },
          error: () => {
            this.exibirMensagem('Erro ao alterar requerimento.');
          }
        });

      }

      return;
    } else {

      if (this.tipo === 'VENDA') {
        this.cadastrarVenda();
      } else {
        this.cadastrarRequerimento();
      }

    }

  }

  atualizarComunidadesDoAnuncio() {

    this.anuncioComunidadeService
      .excluirRelacoesPorAnuncio(this.anuncio.cdAnuncio)
      .subscribe({
        next: () => {
          this.cadastrarRelacoesEdicao();
        },
        error: () => {
          this.exibirMensagem(
            'Anúncio alterado, mas erro ao atualizar comunidades.'
          );
        }
      });

  }

  cadastrarRelacoesEdicao() {

    const relacoes = this.comunidadesSelecionadas.map(
      comunidade => ({
        anuncio: this.anuncio,
        comunidade: comunidade
      })
    );

    this.anuncioComunidadeService.cadastrarRelacoes(relacoes).subscribe({
      next: () => {
        this.exibirMensagem('Anúncio alterado com sucesso.');
        this.router.navigate(['/anuncio-tela', this.anuncio.cdAnuncio]);
      },
      error: () => {
        this.exibirMensagem(
          'Anúncio alterado, mas erro ao publicar nas comunidades.'
        );
      }
    });

  }

  cadastrarVenda() {
    this.anuncio.tipoAnuncio = 'VENDA';

    //nessa pagina é melhor criar um usuario e ficar chamando ele
    this.anuncio.usuarioCria = this.usuarioService.getUsuarioSessao();

    //console.log(this.anuncio);

    this.anuncioService.cadastrarVenda(
      this.anuncio as AnuncioVendaModel,
      this.imagemSelecionada
    ).subscribe({
      next: (anuncioSalvo: AnuncioVendaModel) => {
        //this.exibirMensagem('Anúncio criado com sucesso!');
        //this.router.navigate(['/tela-inicial']);

        /*
        const relacoes = this.comunidadesSelecionadas.map(
          comunidade => ({
            cdAnuncio: anuncioSalvo.cdAnuncio,
            cdComunidade: comunidade.cdComunidade
          })
        );
        */

        this.cadastrarRelacoes(anuncioSalvo);
      },
      error: () => {
        this.exibirMensagem('Erro ao criar anúncio.');
      }
    });
  }

  cadastrarRelacoes(anuncioSalvo: AnuncioModel) {
    const relacoes = this.comunidadesSelecionadas.map(
      comunidade => ({
        anuncio: anuncioSalvo,
        comunidade: comunidade
      })
    );

    this.anuncioComunidadeService.cadastrarRelacoes(relacoes).subscribe({
      next: () => {
        this.exibirMensagem('Anúncio criado com sucesso!');
        this.router.navigate(['/anuncio-tela', anuncioSalvo.cdAnuncio]);
      },
      error: () => {
        this.exibirMensagem(
          'Anúncio criado, mas houve erro ao publicar nas comunidades.'
        );
      }
    });
  }

  cadastrarRequerimento() {
    this.anuncio.tipoAnuncio = 'REQUERIMENTO';
    this.anuncio.usuarioCria = this.usuarioService.getUsuarioSessao();

    this.anuncioService.cadastrarRequerimento(
      this.anuncio as AnuncioRequerimentoModel,
      this.imagemSelecionada
    ).subscribe({
      next: (anuncioSalvo: AnuncioRequerimentoModel) => {
        //this.exibirMensagem('Requerimento criado com sucesso!');
        //this.router.navigate(['/tela-inicial']);

        this.cadastrarRelacoes(anuncioSalvo);

      },
      error: () => {
        this.exibirMensagem('Erro ao criar requerimento.');
      }
    });

  }

  carregarAnuncioParaEditar() {

    this.anuncioService.buscarAnuncio(this.cdAnuncioEdicao).subscribe({
      next: (anuncio) => {
        this.anuncio = anuncio;
        this.carregarComunidadesDoAnuncio();
        const usuarioLogado = this.usuarioService.getUsuarioSessao();

        this.usuarioEhDono =
          this.anuncio.usuarioCria.cdUsuario === usuarioLogado.cdUsuario;

        if (!this.usuarioEhDono) {
          this.exibirMensagem('Você não pode editar este anúncio.');
          this.router.navigate(['/anuncio-tela', this.anuncio.cdAnuncio]);
        }
      },
      error: () => {
        this.exibirMensagem('Erro ao carregar anúncio.');
      }
    });

  }

  comunidadeEstaSelecionada(comunidade: ComunidadeModel): boolean {
    return this.comunidadesSelecionadas.some(
      c => c.cdComunidade === comunidade.cdComunidade
    );
  }

  carregarComunidadesDoAnuncio() {
    this.anuncioComunidadeService
      .listarRelacoesPorAnuncio(this.anuncio.cdAnuncio)
      .subscribe({
        next: (relacoes) => {
          this.comunidadesSelecionadas =
            relacoes.map(relacao => relacao.comunidade);
        },
        error: () => {
          this.exibirMensagem('Erro ao carregar comunidades do anúncio.');
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
