package br.cefetmg.nuclleo.model;

import java.sql.Date;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
//import jakarta.persistence.Version;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity(name = "tb_usuario") // é aqui que se define o nome da tabela no banco de dados
@Table(name = "tb_usuario")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cd_usuario")
    private Long cdUsuario;

    /*
     * @Id
     * 
     * @GeneratedValue
     * 
     * @UuidGenerator
     * 
     * @Column(name = "cdUsuario", updatable = false)
     * private UUID cdUsuario; // existe o tipo UUID
     */

    @Column(name = "nm_usuario", length = 60, nullable = false)
    private String nmUsuario;

    @Column(name = "ft_usuario", length = 1000)
    private String ftUsuario;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    // WRITE_ONLY: a senha (hash) pode ser recebida em requisições, mas nunca é devolvida nas respostas da API
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "senha")
    private String senha;

    @Column(name = "dt_entrada")
    private Date dtEntrada; // cadastro

    @Column(name = "cpf")
    private String cpf;

    @Column(name = "cep")
    private String cep;

    @Column(name = "cidade", length = 100)
    private String cidade;

    @Column(name = "uf", length = 2)
    private String uf;

    @Column(name = "telefone")
    private String telefone;

    @Column(name = "ativo")
    private boolean ativo;

    @Column(name = "perfil", nullable = false)
    private Perfil perfil;
}