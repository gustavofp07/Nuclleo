package br.cefetmg.nuclleo.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
//@Data
@NoArgsConstructor
@AllArgsConstructor
public class Login {
    private String email;
    private String senha;

    /* 
    Login() {
        this.email = "";
        this.senha = "";
    }

    Login(String email, String senha) {
        this.email = email;
        this.senha = senha;
    }
        */
}
