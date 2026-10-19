# Nuclleo

Marketplace comunitário: usuários entram em comunidades da sua região, publicam anúncios de venda ou de procura ("compra"), conversam com quem se interessou, fecham a negociação e avaliam um ao outro. Administradores analisam denúncias e aplicam sanções (suspensão, banimento).

| Parte | Tecnologia | Pasta |
|---|---|---|
| Back-end (API REST + WebSocket) | Java 21, Spring Boot 3.5, Spring Security (JWT), JPA, PostgreSQL | `nuclleo/nuclleo` |
| Front-end (web e Android) | Angular 20, Ionic, Capacitor | `nuclleo/nuclleoFront` |

Produção: a API roda no Render (`https://nuclleo.onrender.com`, via `Dockerfile`) e o banco no Neon (PostgreSQL). As fotos ficam num serviço de arquivos separado (`ARQUIVOS_API_URL`).

## Rodando o back-end

1. Copie `nuclleo/.env.example` para `nuclleo/.env` e preencha as variáveis. O `.env` não vai para o git.
2. Rode a classe `NuclleoApplication` pelo VS Code: a configuração em `nuclleo/.vscode/launch.json` já carrega o `.env`.
   Pelo terminal (com as variáveis exportadas):
   ```bash
   cd nuclleo/nuclleo && ./mvnw spring-boot:run
   ```
3. A documentação da API fica em `http://localhost:8080/swagger-ui.html`.

### Variáveis de ambiente

| Variável | Obrigatória | Para quê |
|---|---|---|
| `DATABASE_URL` | sim | JDBC do PostgreSQL (`jdbc:postgresql://host/banco?sslmode=require`) |
| `DATABASE_USERNAME` / `DATABASE_PASSWORD` | sim | Credenciais do banco |
| `JWT_SECRET` | **sim em produção** | Chave que assina os tokens (mínimo de 32 caracteres). Localmente há um valor padrão |
| `ARQUIVOS_API_URL` | não | Serviço de upload de fotos |

### Profiles

- **padrão (local):** mostra o SQL no log e os detalhes de erro, e aceita a chave JWT padrão.
- **`prod`:** ativado pelo `Dockerfile` (`SPRING_PROFILES_ACTIVE=prod`). Não mostra stack trace nem SQL e **não sobe sem `JWT_SECRET`**. Ver `application-prod.yaml`.

### Testes

```bash
cd nuclleo/nuclleo && ./mvnw test
```

São testes unitários (sem banco): regras de conta suspensa, privacidade do CPF/CEP/e-mail, acesso às transações e ao chat, e segurança do WebSocket.

## Rodando o front-end

```bash
cd nuclleo/nuclleoFront
npm install
npm start
```

Abre em `http://localhost:4200` (ou `ionic serve`, em `:8100`). A URL da API fica em `src/environments/environment.ts`. Hoje ela aponta para o servidor de produção; para usar o back-end local, troque para `http://localhost:8080`.

Para gerar o app Android: `npm run build && npx cap sync android` e abra a pasta `android` no Android Studio.

## Dados de teste

O arquivo `nuclleo/nuclleo/src/main/resources/import.sql` cria usuários de teste (senha `123456` para todos):

- usuários comuns: `gustavo@gmail.com`, `ana@gmail.com`, `pedro@gmail.com`, `julia@gmail.com`
- administradores: `gt@gmail.com`, `manel@gmail.com`

> ⚠️ O script começa com `TRUNCATE` em todas as tabelas, então **apaga todos os dados**. Use só em banco de desenvolvimento, nunca no de produção.

## Segurança e privacidade (resumo)

- Autenticação por JWT. Perfis `USUARIO` e `ADMINISTRADOR` (`SecurityConfig`).
- CPF, CEP e e-mail só aparecem nas respostas para o próprio usuário e para o admin (`DadoPessoalSerializer`). Para os outros, a API manda só `possuiCpf`/`possuiCep`.
- Transações e histórico de conversas: só os participantes veem.
- WebSocket: exige token no CONNECT. Cada canal (`/topic/chat/{id}`, `/topic/comunidade/{id}`, `/topic/notificacoes/{id}`, `/topic/admin/...`) só aceita quem tem direito a ele (`WebSocketAuthInterceptor`).
- No front, as rotas têm guards: `usuarioGuard`, `adminGuard` e `autenticadoGuard`.

## Paginação

Listagens que crescem com o uso vêm em páginas:

- chats (privado e da comunidade): `?antesDe={idMensagem}&limite=50`. Sem `antesDe` vêm as mais recentes.
- anúncios da comunidade, denúncias e usuários (admin): `?page=0&size=20`. A resposta é `{ content, page: { number, size, totalElements, totalPages } }`.
