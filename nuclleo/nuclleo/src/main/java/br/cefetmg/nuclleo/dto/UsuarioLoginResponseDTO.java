package br.cefetmg.nuclleo.dto;

import java.sql.Date;

import br.cefetmg.nuclleo.model.Usuario;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UsuarioLoginResponseDTO {

    private Long cdUsuario;
    private String nmUsuario;
    private String ftUsuario;
    private String email;
    private Date dtEntrada; // cadastro

    public UsuarioLoginResponseDTO(Usuario usuario) {
        this.cdUsuario = usuario.getCdUsuario();
        this.nmUsuario = usuario.getNmUsuario();
        this.ftUsuario = usuario.getFtUsuario();
        this.email = usuario.getEmail();
        this.dtEntrada = usuario.getDtEntrada();
    }
}
