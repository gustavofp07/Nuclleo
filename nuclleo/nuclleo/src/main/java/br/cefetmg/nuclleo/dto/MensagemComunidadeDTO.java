package br.cefetmg.nuclleo.dto;

import java.time.LocalDateTime;

import br.cefetmg.nuclleo.model.MensagemComunidade;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MensagemComunidadeDTO {

    private Long id;
    private Long cdComunidade;
    private Long cdUsuarioRemetente;
    private String nomeRemetente;
    private String ftRemetente;
    // null quando a mensagem foi apagada: o texto nunca sai do back-end
    private String conteudo;
    private LocalDateTime dataEnvio;
    private boolean apagada;

    // Resumo da mensagem respondida (null quando não é resposta)
    private Long cdMensagemResposta;
    private String nomeRemetenteResposta;
    private String conteudoResposta;
    private boolean respostaApagada;

    public MensagemComunidadeDTO(MensagemComunidade mensagem) {
        this.id = mensagem.getId();
        this.cdComunidade = mensagem.getComunidade().getCdComunidade();
        this.cdUsuarioRemetente = mensagem.getRemetente().getCdUsuario();
        this.nomeRemetente = mensagem.getRemetente().getNmUsuario();
        this.ftRemetente = mensagem.getRemetente().getFtUsuario();
        this.dataEnvio = mensagem.getDataEnvio();
        this.apagada = mensagem.isApagada();
        this.conteudo = mensagem.isApagada() ? null : mensagem.getConteudo();

        MensagemComunidade respondida = mensagem.getRespostaA();
        if (respondida != null) {
            this.cdMensagemResposta = respondida.getId();
            this.nomeRemetenteResposta = respondida.getRemetente().getNmUsuario();
            this.respostaApagada = respondida.isApagada();
            this.conteudoResposta = respondida.isApagada() ? null : respondida.getConteudo();
        }
    }
}
