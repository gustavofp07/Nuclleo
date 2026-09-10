TRUNCATE TABLE
    tb_usuario,
    tb_comunidade,
    tb_anuncio,
    tb_anuncio_venda,
    tb_anuncio_requerimento,
    tb_anuncio_comunidade,
    tb_usuario_comunidade,
    interesse,
    mensagem,
    transacao,
    avaliacao
RESTART IDENTITY CASCADE;


-- =============================================
-- USUÁRIOS
-- =============================================
INSERT INTO tb_usuario
(nm_usuario, ft_usuario, email, senha, dt_entrada, cpf, cep, cidade, uf, telefone, ativo)
VALUES
(
    'Gustavo Ferreira',
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1787262577/gerenciador-arquivos/aojbai2iyllycspgn88q.png',
    'gustavo',
    '123',
    '2024-01-10',
    '111.111.111-11',
    '35180008',
    'Timóteo',
    'MG',
    '(31) 99999-1111',
    TRUE
),
(
    'Ana Souza',
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1787699783/gerenciador-arquivos/p7vuhppm4iilth9bjp5l.png',
    'ana',
    '123',
    '2024-02-15',
    '222.222.222-22',
    '35177000',
    'Antônio Dias',
    'MG',
    '(31) 99999-2222',
    TRUE
),
(
    'Pedro Lima',
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1787784685/gerenciador-arquivos/zyk4ho5d4dubdxcz7wyu.jpg',
    'pedro',
    '123',
    '2024-03-20',
    '333.333.333-33',
    '35920000',
    'Nova Era',
    'MG',
    '(31) 99999-3333',
    TRUE
),
(
    'Julia Mendes',
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1787618221/gerenciador-arquivos/b7j0gknvct9t7vubxpa7.png',
    'julia',
    '123',
    '2024-04-05',
    '444.444.444-44',
    '30140010',
    'Belo Horizonte',
    'MG',
    '(31) 99999-4444',
    TRUE
);


-- =============================================
-- COMUNIDADES
-- =============================================
INSERT INTO tb_comunidade
(nm_comunidade, dt_criacao, descricao, foto, cep, cidade, uf, cd_usuario_cria)
VALUES
(
    'Tecnologia CEFET',
    '2024-01-15',
    'Comunidade sobre tecnologia e desenvolvimento de software',
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1787699083/gerenciador-arquivos/pks2dgcebo5qnldhoopv.webp',
    '35180008',
    'Timóteo',
    'MG',
    1
),
(
    'Marketplace Geral',
    '2024-02-20',
    'Compra e venda de produtos em geral',
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1787694752/gerenciador-arquivos/rldvwbzl8frzh11p7eoq.webp',
    '01001000',
    'São Paulo',
    'SP',
    2
),
(
    'Eletrônicos Usados',
    '2024-03-10',
    'Anúncios de eletrônicos seminovos',
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1787618770/gerenciador-arquivos/zxwyafmng8xvbvbqhmmm.png',
    '35010000',
    'Governador Valadares',
    'MG',
    3
),
(
    'Livros e Cursos',
    '2024-04-01',
    'Troca e venda de livros e materiais de estudo',
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1787618766/gerenciador-arquivos/m1omnlck2bog7pxn33g1.png',
    '50030170',
    'Recife',
    'PE',
    4
),
(
    'Comunidade Belo Horizonte',
    '2024-04-02',
    'Comunidade regional de Belo Horizonte',
    NULL,
    '30140010',
    'Belo Horizonte',
    'MG',
    1
),
(
    'Comunidade Juiz de Fora',
    '2024-04-03',
    'Comunidade regional de Juiz de Fora',
    NULL,
    '36010011',
    'Juiz de Fora',
    'MG',
    2
),
(
    'Comunidade Paulista',
    '2024-04-04',
    'Comunidade da região da Avenida Paulista',
    NULL,
    '01310200',
    'São Paulo',
    'SP',
    3
),
(
    'Comunidade Santos',
    '2024-04-05',
    'Comunidade regional de Santos',
    NULL,
    '11010010',
    'Santos',
    'SP',
    4
),
(
    'Comunidade Cuiabá',
    '2024-04-06',
    'Comunidade regional de Cuiabá',
    NULL,
    '78005580',
    'Cuiabá',
    'MT',
    1
),
(
    'Comunidade Sinop',
    '2024-04-07',
    'Comunidade regional de Sinop',
    NULL,
    '78550000',
    'Sinop',
    'MT',
    2
),
(
    'Comunidade Rondonópolis',
    '2024-04-08',
    'Comunidade regional de Rondonópolis',
    NULL,
    '78700000',
    'Rondonópolis',
    'MT',
    3
),
(
    'Comunidade Olinda',
    '2024-04-09',
    'Comunidade regional de Olinda',
    NULL,
    '53020050',
    'Olinda',
    'PE',
    4
),
(
    'Comunidade Caruaru',
    '2024-04-10',
    'Comunidade regional de Caruaru',
    NULL,
    '55002000',
    'Caruaru',
    'PE',
    1
);


-- =============================================
-- ANÚNCIOS
-- =============================================
INSERT INTO tb_anuncio
(nm_anuncio, descricao, habilitado, tipo_anuncio, cd_usuario_cria)
VALUES
(
    'Notebook Dell i5',
    'Notebook Dell em ótimo estado, 8GB RAM',
    TRUE,
    'VENDA',
    1
),
(
    'Procuro Headset Gamer',
    'Busco headset gamer com microfone até R$200',
    TRUE,
    'REQUERIMENTO',
    2
),
(
    'iPhone 13 128GB',
    'iPhone 13 128GB, cor preta, pouco uso',
    TRUE,
    'VENDA',
    3
),
(
    'Procuro Livro Clean Code',
    'Busco livro Clean Code do Robert Martin',
    TRUE,
    'REQUERIMENTO',
    4
),
(
    'Monitor LG 24"',
    'Monitor LG 24 polegadas Full HD, HDMI, sem riscos',
    TRUE,
    'VENDA',
    2
),
(
    'Teclado Mecânico',
    'Teclado mecânico switch azul, RGB, ABNT2',
    TRUE,
    'VENDA',
    1
),
(
    'Mouse Gamer Logitech',
    'Mouse Logitech G502, 16000 DPI, com fio',
    TRUE,
    'VENDA',
    3
),
(
    'SSD 480GB Kingston',
    'SSD Kingston 480GB SATA, funcionando perfeitamente',
    TRUE,
    'VENDA',
    4
),
(
    'Procuro Placa de Vídeo',
    'Busco GTX 1060 ou RX 580, aceito propostas',
    TRUE,
    'REQUERIMENTO',
    1
),
(
    'Fone Sony WH-1000XM4',
    'Fone com cancelamento de ruído, pouco uso, na caixa',
    TRUE,
    'VENDA',
    2
),
(
    'Procuro Notebook até 2000',
    'Busco notebook para estudos, mínimo i5 e 8GB RAM',
    TRUE,
    'REQUERIMENTO',
    3
),
(
    'HD Externo 1TB Seagate',
    'HD externo 1TB USB 3.0, sem bad sectors',
    TRUE,
    'VENDA',
    4
),
(
    'Cadeira Gamer DXRacer',
    'Cadeira gamer preta e vermelha, reclinável, ótimo estado',
    TRUE,
    'VENDA',
    1
),
(
    'Procuro Mesa para PC',
    'Busco mesa para setup gamer, mínimo 1.20m de largura',
    TRUE,
    'REQUERIMENTO',
    2
);


-- =============================================
-- ANÚNCIOS DE VENDA
-- =============================================
INSERT INTO tb_anuncio_venda
(cd_anuncio, ft_anuncio, valor)
VALUES
(
    1,
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1787618693/gerenciador-arquivos/kx7c5finmddrb7xetobr.png',
    1800.00
),
(
    3,
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1787618345/gerenciador-arquivos/nhqetku0nsvxkbw5y37u.png',
    3200.00
),
(
    5,
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1787618148/gerenciador-arquivos/e2szn0nvvfwk6jnmhteg.png',
    950.00
),
(
    6,
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1787611887/gerenciador-arquivos/ebn176me0naxle8p8pfg.png',
    280.00
),
(
    7,
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1787504927/gerenciador-arquivos/eyja8q7lgq9ijt7u6pp4.jpg',
    320.00
),
(
    8,
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1787262577/gerenciador-arquivos/aojbai2iyllycspgn88q.png',
    180.00
),
(
    10,
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1787260946/gerenciador-arquivos/u1pgbeibazidyyeb1jfq.jpg',
    1400.00
),
(
    12,
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1787049689/gerenciador-arquivos/yvhzwyhebmv75km76wt9.jpg',
    220.00
),
(
    13,
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1786748414/gerenciador-arquivos/zmia4kquzmumltn1ghjx.png',
    1100.00
);


-- =============================================
-- ANÚNCIOS DE REQUERIMENTO
-- =============================================
INSERT INTO tb_anuncio_requerimento
(cd_anuncio, ft_anuncio, valor_min, valor_max)
VALUES
(
    2,
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1786746733/gerenciador-arquivos/kbedf7rissqxe7rbntk0.png',
    100.00,
    200.00
),
(
    4,
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1786745812/gerenciador-arquivos/bkafsc4bqt9im3sd5cxt.png',
    30.00,
    80.00
),
(
    9,
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1786741020/gerenciador-arquivos/smeh5vibmw3hirb6jqcs.png',
    400.00,
    800.00
),
(
    11,
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1787270501/gerenciador-arquivos/si9hacjbxfk6tnaaznzw.gif',
    800.00,
    2000.00
),
(
    14,
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1787252747/gerenciador-arquivos/jb6uoducez4qtpa944nl.gif',
    150.00,
    400.00
);


-- =============================================
-- ANÚNCIOS x COMUNIDADES
-- =============================================
INSERT INTO tb_anuncio_comunidade
(cd_anuncio, cd_comunidade)
VALUES
(1, 1),
(1, 3),
(2, 3),
(3, 2),
(4, 4),
(5, 3),
(6, 1),
(7, 3),
(8, 1),
(9, 3),
(10, 2),
(11, 1),
(12, 2),
(13, 2),
(14, 2);


-- =============================================
-- USUÁRIOS x COMUNIDADES
-- =============================================
INSERT INTO tb_usuario_comunidade
(cd_usuario, cd_comunidade)
VALUES
(1, 1),
(2, 1),
(3, 2),
(4, 3),
(1, 4);


-- =============================================
-- INTERESSES
-- =============================================
INSERT INTO interesse
(usuario, anuncio, dt_criacao, finalizado, aceito,
 avaliacao_interessado_feita, avaliacao_anunciante_feita)
VALUES

-- Ana demonstrou interesse no Notebook Dell do Gustavo.
(
    2,
    1,
    '2024-05-01',
    FALSE,
    FALSE,
    FALSE,
    FALSE
),

-- Julia demonstrou interesse no iPhone do Pedro.
-- Interesse aceito, permitindo a conversa.
(
    4,
    3,
    '2024-05-02',
    FALSE,
    TRUE,
    FALSE,
    FALSE
),

-- Julia demonstrou interesse no Teclado Mecânico do Gustavo.
(
    4,
    6,
    '2024-05-03',
    FALSE,
    FALSE,
    FALSE,
    FALSE
);


-- =============================================
-- MENSAGENS
-- Conversa referente ao interesse 2:
-- Julia interessada no iPhone do Pedro.
-- =============================================
INSERT INTO mensagem
(cd_interesse, cd_usuario_remetente, conteudo, data_envio)
VALUES
(
    2,
    4,
    'Olá Pedro! O iPhone ainda está disponível?',
    '2024-05-02 14:00:00'
),
(
    2,
    3,
    'Olá Julia! Sim, ainda está disponível.',
    '2024-05-02 14:05:00'
),
(
    2,
    4,
    'Ótimo! Tenho interesse em fechar a compra.',
    '2024-05-02 14:08:00'
);


-- =============================================
-- TRANSAÇÃO
-- Exemplo de uma negociação concluída.
-- Julia comprou o iPhone anunciado pelo Pedro.
-- =============================================
INSERT INTO transacao
(valor, data, cd_usuario, cd_anuncio)
VALUES
(
    3200.00,
    '2024-05-05',
    4,
    3
);


-- =============================================
-- AVALIAÇÕES
-- As duas partes podem avaliar uma à outra.
-- =============================================
INSERT INTO avaliacao
(cd_transacao, cd_avaliador, cd_avaliado, nota, dt_avaliacao)
VALUES
(
    1,
    4,
    3,
    5,
    '2024-05-06'
),
(
    1,
    3,
    4,
    5,
    '2024-05-06'
);


-- =============================================
-- ATUALIZA O INTERESSE DA NEGOCIAÇÃO CONCLUÍDA
-- =============================================
UPDATE interesse
SET
    finalizado = TRUE,
    aceito = TRUE,
    avaliacao_interessado_feita = TRUE,
    avaliacao_anunciante_feita = TRUE
WHERE id = 2;
