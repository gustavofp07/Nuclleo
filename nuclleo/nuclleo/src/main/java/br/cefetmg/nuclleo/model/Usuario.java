package br.cefetmg.nuclleo.model;

import java.sql.Date;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

//@NoArgsConstructor
//@AllArgsConstructor
*/
@Getter
@Setter
@ToString

public class Usuario {
    Long cdUsuario;
    String ftUsuario;
    String nmUsuario;
    String email;
    String senha;
    Date dtEntrada; //cadastro
    String cpf;
    String cep;
    String telefone; 
}

