import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonSpinner,
  IonContent,
  IonMenuButton,
  IonButtons,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  createOutline, locationOutline, calendarOutline, checkmarkCircleOutline, trashOutline,
  ellipseOutline, star, starHalf, starOutline, cashOutline, chevronForwardOutline,
  pricetagOutline, imageOutline, flagOutline, mailOutline, shieldCheckmarkOutline, banOutline,
  refreshOutline, closeCircleOutline
} from 'ionicons/icons';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { UsuarioModel } from 'src/app/model/usuario.model';
import { AnuncioModel } from 'src/app/model/anuncio.model';
import { UsuarioService } from 'src/app/services/usuario.service';
import { AnuncioService } from 'src/app/services/anuncio.service';
import { UsuarioComunidadeService } from 'src/app/services/usuario-comunidade.service';
import { AvaliacaoService } from 'src/app/services/avaliacao.service';
import { TokenService } from 'src/app/services/token.service';
import { DenunciaService } from 'src/app/services/denuncia.service';
import { AdminService } from 'src/app/services/admin.service';
import { DenunciaModel, SancaoModel, rotuloMotivo, rotuloSancao, rotuloStatusAlvo } from 'src/app/model/denuncia.model';

// Uma linha do histórico de moderação do admin (sanção aplicada ou denúncia descartada)
interface ItemHistoricoModeracao {
  data: string;
  texto: string;
  detalhe: string;
  icone: string;
  cdDenuncia: number | null;
}

@Component({
  selector: 'app-usuario-perfil',
  templateUrl: './usuario-perfil.page.html',
  styleUrls: ['./usuario-perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    IonSpinner,
    IonContent,
    IonMenuButton,
    IonButtons,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonIcon
  ]
})
export class UsuarioPerfilPage {
  usuario: UsuarioModel;
  anuncios: AnuncioModel[] = [];
  nivelCadastro: number = 1;
  ehPerfilProprio: boolean = true;
  carregando: boolean = false;
  carregandoAnuncios: boolean = true;

  mediaAvaliacao: number = 0;
  totalAvaliacoes: number = 0;
  estrelasArray = [1, 2, 3, 4, 5];

  // Administrador: no próprio perfil vê o histórico de moderação;
  // no perfil de outra pessoa, só visualiza (não navega para os anúncios)
  ehAdminLogado: boolean = false;
  historicoModeracao: ItemHistoricoModeracao[] = [];
  carregandoHistorico: boolean = false;

  rotuloStatusAlvo = rotuloStatusAlvo;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController,
    private alertController: AlertController,
    private anuncioService: AnuncioService,
    private usuarioComunidadeService: UsuarioComunidadeService,
    private avaliacaoService: AvaliacaoService,
    private tokenService: TokenService,
    private denunciaService: DenunciaService,
    private adminService: AdminService
  ) {
    addIcons({
      createOutline, locationOutline, calendarOutline, checkmarkCircleOutline, trashOutline,
      ellipseOutline, star, starHalf, starOutline, cashOutline, chevronForwardOutline,
      pricetagOutline, imageOutline, flagOutline, mailOutline, shieldCheckmarkOutline, banOutline,
      refreshOutline, closeCircleOutline
    });

    this.usuario = new UsuarioModel();
  }

  ionViewWillEnter() {
    if (!this.tokenService.temToken()) {
      this.router.navigate(['/login']);
      return;
    }

    const cdUsuarioLogado = this.tokenService.extrair().cdUsuario;
    const cdUsuarioParam = Number(this.activatedRoute.snapshot.paramMap.get('cdUsuario'));
    const cdUsuario = cdUsuarioParam || cdUsuarioLogado;

    this.ehPerfilProprio = cdUsuario === cdUsuarioLogado;
    this.ehAdminLogado = this.tokenService.isAdmin();
    this.usuario = new UsuarioModel();
    this.anuncios = [];
    this.historicoModeracao = [];

    this.carregarUsuarioPorId(cdUsuario);
  }

  get perfilAdminProprio(): boolean {
    return this.ehAdminLogado && this.ehPerfilProprio;
  }

  rotuloTipoAnuncio(tipo: string): string {
    return tipo === 'REQUERIMENTO' ? 'COMPRA' : 'VENDA';
  }

  carregarUsuarioPorId(cdUsuario: number) {
    this.carregando = true;

    this.usuarioService.buscarUsuario(cdUsuario).subscribe({
      next: (usuario: UsuarioModel) => {
        this.usuario = usuario;
        this.calcularNivelCadastro();

        if (this.perfilAdminProprio) {
          this.carregarHistoricoModeracao();
        } else {
          this.carregarAvaliacao();
        }

        if (!this.ehPerfilProprio) {
          this.carregarAnunciosUsuario();
        }

        this.carregando = false;
      },
      error: () => {
        this.exibirMensagem('Erro ao carregar perfil.');
        this.carregando = false;
      }
    });
  }

  carregarAvaliacao() {
    this.mediaAvaliacao = 0;
    this.totalAvaliacoes = 0;

    this.avaliacaoService.media(this.usuario.cdUsuario).subscribe({
      next: (media) => this.mediaAvaliacao = media ?? 0,
      error: () => this.mediaAvaliacao = 0
    });

    this.avaliacaoService.total(this.usuario.cdUsuario).subscribe({
      next: (total) => this.totalAvaliacoes = total ?? 0,
      error: () => this.totalAvaliacoes = 0
    });
  }

  calcularNivelCadastro() {
    const temCpf = !!this.usuario.cpf?.trim();
    const temCep = !!this.usuario.cep?.trim();

    if (temCpf && temCep) {
      this.nivelCadastro = 3;
    } else if (temCpf || temCep) {
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
    const token = this.tokenService.extrair();

    this.usuarioService.autenticar({ email: token.email, senha }).subscribe({
      next: () => this.excluir(),
      error: () => this.exibirMensagem('Senha incorreta.')
    });
  }

  excluir() {
    const token = this.tokenService.extrair();

    this.usuarioComunidadeService.excluirPorUsuario(token.cdUsuario).subscribe({
      next: () => {
        this.usuarioService.excluirUsuario().subscribe({
          next: () => {
            this.tokenService.excluir();
            this.router.navigate(['/login']);
          },
          error: () => this.exibirMensagem('Erro ao excluir o usuário.')
        });
      },
      error: () => this.exibirMensagem('Erro ao remover usuário das comunidades.')
    });
  }

  denunciarUsuario() {
    this.denunciaService.abrirFormulario('USUARIO', this.usuario.cdUsuario);
  }

  // Junta as sanções que o admin aplicou e as denúncias que ele descartou, da mais recente para a mais antiga
  carregarHistoricoModeracao() {
    this.carregandoHistorico = true;

    forkJoin({
      sancoes: this.adminService.listarSancoesAplicadasPorMim().pipe(catchError(() => of([] as SancaoModel[]))),
      descartadas: this.adminService.listarDenunciasDescartadasPorMim().pipe(catchError(() => of([] as DenunciaModel[])))
    }).subscribe(({ sancoes, descartadas }) => {
      const itensSancao: ItemHistoricoModeracao[] = sancoes.map(sancao => ({
        data: sancao.dtInicio,
        texto: rotuloSancao(sancao),
        detalhe: sancao.cdDenuncia ? 'A partir de uma denúncia' : 'Ação manual',
        icone: sancao.tipo === 'REATIVACAO' ? 'refresh-outline' : (sancao.tipo === 'EXCLUSAO' ? 'trash-outline' : 'ban-outline'),
        cdDenuncia: sancao.cdDenuncia
      }));

      const itensDescarte: ItemHistoricoModeracao[] = descartadas.map(denuncia => ({
        data: denuncia.dtAnalise ?? denuncia.dtCriacao,
        texto: `Denúncia descartada: ${denuncia.tipoAlvo === 'ANUNCIO' ? 'anúncio "' + denuncia.nmAnuncio + '"' : denuncia.nmUsuarioDenunciado}`,
        detalhe: rotuloMotivo(denuncia.motivo),
        icone: 'close-circle-outline',
        cdDenuncia: denuncia.cdDenuncia
      }));

      this.historicoModeracao = [...itensSancao, ...itensDescarte]
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      this.carregandoHistorico = false;
    });
  }

  abrirDenunciaDoHistorico(item: ItemHistoricoModeracao) {
    if (item.cdDenuncia) {
      this.router.navigate(['/admin/denuncia', item.cdDenuncia]);
    }
  }

  carregarAnunciosUsuario() {
    this.carregandoAnuncios = true;

    // O admin usa o endpoint dele, que também traz os anúncios suspensos
    const anuncios$ = this.ehAdminLogado
      ? this.adminService.listarAnunciosDoUsuario(this.usuario.cdUsuario)
      : this.anuncioService.listarAnunciosPorUsuario(this.usuario.cdUsuario);

    anuncios$.subscribe({
      next: (dados) => {
        this.anuncios = dados;
        this.carregandoAnuncios = false;
      },
      error: () => {
        console.error('Erro ao carregar anúncios do usuário.');
        this.carregandoAnuncios = false;
      }
    });
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
