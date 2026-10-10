package br.cefetmg.nuclleo.model;

import java.sql.Date;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

    // WRITE_ONLY: a senha (hash) pode ser recebida em requisições, mas nunca é
    // devolvida nas respostas da API
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

    // READ_ONLY: o status aparece nas respostas, mas é ignorado se vier no corpo
    // de uma requisição. Só o próprio sistema (moderação/exclusão) altera o status.
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false, columnDefinition = "varchar(20) default 'ATIVO' not null")
    private Status status = Status.ATIVO;

    // Preenchido somente quando status = SUSPENSO
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @Column(name = "suspenso_ate")
    private LocalDateTime suspensoAte;

    @Enumerated(EnumType.STRING)
    @Column(name = "perfil", nullable = false)
    private Perfil perfil;

    /**
     * Indica se a conta pode ser usada agora.
     * Uma suspensão cujo prazo já passou conta como ativa, mesmo que a rotina
     * agendada ainda não tenha atualizado o status no banco.
     */
    @JsonIgnore
    public boolean isAtivo() {
        if (status == Status.ATIVO) {
            return true;
        }
        return status == Status.SUSPENSO
                && suspensoAte != null
                && !suspensoAte.isAfter(LocalDateTime.now());
    }
}
