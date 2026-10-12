export class MensagemModel {
  id?: number;
  cdInteresse!: number;
  cdUsuarioRemetente!: number;
  nomeRemetente!: string;
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
