import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import {
  IonContent,
  IonInput,
  IonItem,
  IonButton,
  ToastController
} from '@ionic/angular/standalone';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


import { ComunidadeModel } from 'src/app/model/comunidade.model';
import { ComunidadeService } from 'src/app/services/comunidade.service';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-criar-comunidade',
  templateUrl: './criar-comunidade.page.html',
  styleUrls: ['./criar-comunidade.page.scss'],
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,

    IonContent,
    IonInput,
    IonItem,
    IonButton
  ]
})

export class CriarComunidadePage {
  modoEdicao: boolean = false;

  comunidade: ComunidadeModel;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private activatedRoute: ActivatedRoute,
    private comunidadeService: ComunidadeService,
    private usuarioService: UsuarioService
  ) {

    this.comunidade = new ComunidadeModel();

  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.comunidade = new ComunidadeModel();

    const cdComunidade = this.activatedRoute.snapshot.paramMap.get('cdComunidade');

    if (cdComunidade) {
      this.modoEdicao = true;

      this.comunidadeService.buscarComunidade(Number(cdComunidade)).subscribe({
        next: async (comunidade: ComunidadeModel) => {
          this.comunidade = comunidade;
        },
        error: async () => {
          //console.log('Erro ao logar');
          this.exibirMensagem('Erro ao carregar comunidade.');
        }
      });
    }
  }

  salvarComunidade() {
    if (this.modoEdicao) {
      this.atualizarComunidade();
    } else {
      this.cadastrarComunidade();
    }
  }

  async atualizarComunidade() {
    this.comunidadeService.atualizarComunidade(this.comunidade).subscribe({
      next: async (comunidade: ComunidadeModel) => {
        this.exibirMensagem('Comunidade atualizada com sucesso!');
        this.router.navigate(['/minhas-comunidades']);
      },
      error: async () => {
        //console.log('Erro ao logar');
        this.exibirMensagem('Erro ao atualizar comunidade.');
      }
    });

  };

  async cadastrarComunidade() {
    this.comunidade.usuarioCria = this.usuarioService.getUsuarioSessao();

    this.comunidadeService.cadastrarComunidade(this.comunidade).subscribe({
      next: async (comunidade: ComunidadeModel) => {
        this.exibirMensagem('Comunidade criada com sucesso!');
        this.router.navigate(['/minhas-comunidades']);
      },
      error: async () => {
        //console.log('Erro ao logar');
        this.exibirMensagem('Erro ao nova criar comunidade.');
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