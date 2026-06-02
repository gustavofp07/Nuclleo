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
  IonLabel
} from '@ionic/angular/standalone';

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
    IonMenuButton,
    IonList,
    IonCheckbox,
    IonLabel
  ]
})
export class CriarAnuncioPage {
  anuncio!: AnuncioModel;
  //anuncioVenda: AnuncioVendaModel;
  //anuncioRequerimento: AnuncioRequerimentoModel;

  tipo = '';

  imagemSelecionada?: File;
  previewImagem?: string;

  comunidadesSelecionadas: ComunidadeModel[];
  comunidades: ComunidadeModel[];

  constructor(
    private activatedRoute: ActivatedRoute,
    private anuncioService: AnuncioService,
    private usuarioService: UsuarioService,
    private usuarioComunidadeService: UsuarioComunidadeService,
    private anuncioComunidadeService: AnuncioComunidadeService,
    private toastController: ToastController,
    private router: Router
  ) {

    //this.anuncioVenda = new AnuncioVendaModel();
    //this.anuncioRequerimento = new AnuncioRequerimentoModel();

    this.comunidades = [];
    this.comunidadesSelecionadas = [];
  }

  ngOnInit() {
    //carregar o usuario ver ser existe primeiro

    this.tipo = this.activatedRoute.snapshot.paramMap.get('tipo')?.toUpperCase() || '';

    if (this.tipo === 'VENDA') {
      this.anuncio = new AnuncioVendaModel();
    } else {
      this.anuncio = new AnuncioRequerimentoModel();
    }

    this.carregarComunidadesUsuario();// manda o usuario logado aqui
  }

  ionViewWillEnter() {
    this.carregarComunidadesUsuario();
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
      this.comunidadesSelecionadas.push(comunidade);
    } else {
      this.comunidadesSelecionadas =
        this.comunidadesSelecionadas.filter(
          c => c.cdComunidade !== comunidade.cdComunidade
        );
    }
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
    } else {
      this.cadastrarRequerimento();
    }
  }

  cadastrarVenda() {
    this.anuncio.tipoAnuncio = 'VENDA';

    //nessa pagina é melhor criar um usuario e ficar chamando ele
    this.anuncio.usuarioCria = this.usuarioService.getUsuarioSessao();

    //console.log(this.anuncio);

    this.anuncioService.cadastrarVenda(this.anuncio as AnuncioVendaModel).subscribe({
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
        this.router.navigate(['/tela-inicial']);
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

    this.anuncioService.cadastrarRequerimento(this.anuncio as AnuncioRequerimentoModel).subscribe({
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

/*
    const anuncio = {
      nmAnuncio: this.nmAnuncio,
      descricao: this.descricao,
      ftAnuncio: '',
      valorMin: this.valorMin,
      valorMax: this.valorMax,
      tipoAnuncio: 'REQUERIMENTO',
      usuarioCria: this.usuarioService.getUsuarioSessao(),
      comunidades: this.comunidadesSelecionadas
    };

    
    */

/*
const anuncio = {
  nmAnuncio: this.nmAnuncio,
  descricao: this.descricao,
  ftAnuncio: '',
  valor: this.valor,
  tipoAnuncio: 'VENDA',
  usuarioCria: this.usuarioService.getUsuarioSessao(),
  comunidades: this.comunidadesSelecionadas
};
*/