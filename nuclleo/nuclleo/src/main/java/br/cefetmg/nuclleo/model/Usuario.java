package br.cefetmg.nuclleo.model;

import java.sql.Date;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
//import jakarta.persistence.Version;

import lombok.AllArgsConstructor;
//import lombok.Data;
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
@Entity(name = "tb_Usuario")// é aqui que se define o nome da tabela no banco de dados
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cdUsuario;

    /*
    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "cdUsuario", updatable = false)
    private UUID cdUsuario; // existe o tipo UUID
    */


    @Column(length = 60, nullable = false)
    private String nmUsuario;

    @Column
    private String ftUsuario;

    @Column
    private String email;

    @Column
    private String senha;

    @Column
    private Date dtEntrada; // cadastro

    @Column
    private String cpf;

    @Column
    private String cep;

    @Column
    private String telefone;
}

