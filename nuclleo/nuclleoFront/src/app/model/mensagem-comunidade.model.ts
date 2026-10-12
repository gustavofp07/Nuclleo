export class MensagemComunidadeModel {
  id!: number;
  cdComunidade!: number;
  cdUsuarioRemetente!: number;
  nomeRemetente!: string;
  ftRemetente?: string | null;
  // null quando a mensagem foi apagada (o back-end não envia o texto)
  conteudo!: string | null;
  dataEnvio!: string;
  apagada?: boolean;

  // Preenchidos quando a mensagem é uma resposta
  cdMensagemResposta?: number | null;
  nomeRemetenteResposta?: string | null;
  conteudoResposta?: string | null;
  respostaApagada?: boolean;
}
