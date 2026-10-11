package br.cefetmg.nuclleo.dto;

import java.time.LocalDateTime;

import br.cefetmg.nuclleo.model.Sancao;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor 
public class SancaoResponseDTO {
    private Long cdSancao;

    private String tipoAlvo;
    //private TipoAlvo tipoAlvo;

    private Long cdUsuario;
    private String nmUsuario;
    //private Usuario usuario;

    // Preenchido somente quando tipoAlvo = ANUNCIO
    private Long cdAnuncio;
    private String nmAnuncio;
    //private Anuncio anuncio;

    private String tipo;
    //private TipoSancao tipo;

    private Integer dias;
    private LocalDateTime dtInicio;
    private LocalDateTime dtFim;

    private Long cdAdmin;
    private String nmAdmin;
    //private Usuario admin;

    private Long cdDenuncia;
    //private Denuncia denuncia;

    public SancaoResponseDTO(Sancao sancao) {
        this.cdSancao = sancao.getCdSancao();
        this.tipoAlvo = sancao.getTipoAlvo().name();
        this.cdUsuario = sancao.getUsuario().getCdUsuario();
        this.nmUsuario = sancao.getUsuario().getNmUsuario();
        if (sancao.getAnuncio() != null) {
            this.cdAnuncio = sancao.getAnuncio().getCdAnuncio();
            this.nmAnuncio = sancao.getAnuncio().getNmAnuncio();
        }
        this.tipo = sancao.getTipo().name();
        this.dias = sancao.getDias();
        this.dtInicio = sancao.getDtInicio();
        this.dtFim = sancao.getDtFim();
        if (sancao.getAdmin() != null) {
            this.cdAdmin = sancao.getAdmin().getCdUsuario();
            this.nmAdmin = sancao.getAdmin().getNmUsuario();
        }
        if (sancao.getDenuncia() != null) {
            this.cdDenuncia = sancao.getDenuncia().getCdDenuncia();
        }
    }
}
