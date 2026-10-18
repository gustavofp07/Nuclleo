-- O usuário não tem mais telefone: remove a coluna antiga do banco
ALTER TABLE tb_usuario DROP COLUMN IF EXISTS telefone;

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
    avaliacao,
    tb_denuncia,
    tb_sancao
RESTART IDENTITY CASCADE;


-- =============================================
-- USUÁRIOS
-- Senha inicial de todos: 123456
-- =============================================
INSERT INTO tb_usuario
(nm_usuario, ft_usuario, email, senha, dt_entrada, cpf, cep, cidade, uf, status, perfil)
VALUES
(
    'Gustavo Ferreira',
    'https://res.cloudinary.com/uwc2qxgb/image/upload/v1787262577/gerenciador-arquivos/aojbai2iyllycspgn88q.png',
    'gustavo@gmail.com',
    '$2a$10$WzIFeoOrVt3yaqoBQy1nKeOmaWcKNvGn0sdvY68K7o6ncQeOnXJ7S',
    '2024-01-10',
    '111.111.111-11',
    '35180008',
    'Timóteo',
    'MG',
    'ATIVO',
    'USUARIO'
),
(
    'Ana Souza',
    NULL,
    'ana@gmail.com',
    '$2a$10$WzIFeoOrVt3yaqoBQy1nKeOmaWcKNvGn0sdvY68K7o6ncQeOnXJ7S',
    '2024-02-15',
    '222.222.222-22',
    '35177000',
    'Antônio Dias',
    'MG',
    'ATIVO',
    'USUARIO'
),
(
    'Pedro Lima',
    NULL,
    'pedro@gmail.com',
    '$2a$10$WzIFeoOrVt3yaqoBQy1nKeOmaWcKNvGn0sdvY68K7o6ncQeOnXJ7S',
    '2024-03-20',
    '333.333.333-33',
    '35920000',
    'Nova Era',
    'MG',
    'ATIVO',
    'USUARIO'
),
(
    'Julia Mendes',
    NULL,
    'julia@gmail.com',
    '$2a$10$WzIFeoOrVt3yaqoBQy1nKeOmaWcKNvGn0sdvY68K7o6ncQeOnXJ7S',
    '2024-04-05',
    '444.444.444-44',
    '30140010',
    'Belo Horizonte',
    'MG',
    'ATIVO',
    'USUARIO'
);

INSERT INTO tb_usuario
(nm_usuario, email, senha, dt_entrada, status, perfil)
VALUES
(
    'Gustavo',
    'gt@gmail.com',
    '$2a$10$WzIFeoOrVt3yaqoBQy1nKeOmaWcKNvGn0sdvY68K7o6ncQeOnXJ7S',
    CURRENT_DATE,
    'ATIVO',
    'ADMINISTRADOR'
),
(
    'Emanuel',
    'manel@gmail.com',
    '$2a$10$WzIFeoOrVt3yaqoBQy1nKeOmaWcKNvGn0sdvY68K7o6ncQeOnXJ7S',
    CURRENT_DATE,
    'ATIVO',
    'ADMINISTRADOR'
);

-- =============================================
-- COMUNIDADES
-- =============================================
INSERT INTO tb_comunidade
(nm_comunidade, dt_criacao, descricao, foto, cep, cidade, uf, cd_usuario_cria)
VALUES
(
    'CEFET Timóteo - Compra e Venda',
    '2024-01-15',
    'Comunidade destinada à compra, venda e troca de produtos entre alunos e moradores da região de Timóteo.',
    NULL,
    '35180008',
    'Timóteo',
    'MG',
    1
),
(
    'Desapega Vale do Aço',
    '2024-02-20',
    'Espaço para negociação de produtos usados entre moradores do Vale do Aço.',
    NULL,
    '35177000',
    'Antônio Dias',
    'MG',
    2
),
(
    'Eletrônicos Usados - Vale do Aço',
    '2024-03-10',
    'Comunidade voltada para compra e venda de celulares, computadores, acessórios e eletrônicos usados.',
    NULL,
    '35920000',
    'Nova Era',
    'MG',
    3
),
(
    'Livros, Apostilas e Materiais de Estudo',
    '2024-04-01',
    'Comunidade para compra, venda e troca de livros, apostilas e materiais acadêmicos.',
    NULL,
    '30140010',
    'Belo Horizonte',
    'MG',
    4
),
(
    'Compra e Venda Belo Horizonte',
    '2024-04-02',
    'Comunidade para anúncios de produtos e negociações entre moradores de Belo Horizonte e região.',
    NULL,
    '30140010',
    'Belo Horizonte',
    'MG',
    1
),
(
    'Desapega Juiz de Fora',
    '2024-04-03',
    'Espaço para venda, compra e troca de produtos usados em Juiz de Fora.',
    NULL,
    '36010011',
    'Juiz de Fora',
    'MG',
    2
),
(
    'Classificados Avenida Paulista',
    '2024-04-04',
    'Comunidade de classificados para pessoas que trabalham, estudam ou moram na região da Avenida Paulista.',
    NULL,
    '01310200',
    'São Paulo',
    'SP',
    3
),
(
    'Desapega Santos',
    '2024-04-05',
    'Comunidade destinada à negociação de produtos usados entre moradores de Santos e região.',
    NULL,
    '11010010',
    'Santos',
    'SP',
    4
),
(
    'Compra e Venda Cuiabá',
    '2024-04-06',
    'Comunidade para anúncios de produtos novos e usados em Cuiabá.',
    NULL,
    '78005580',
    'Cuiabá',
    'MT',
    1
),
(
    'Classificados Sinop',
    '2024-04-07',
    'Espaço para compra, venda e troca de produtos entre moradores de Sinop.',
    NULL,
    '78550000',
    'Sinop',
    'MT',
    2
),
(
    'Desapega Rondonópolis',
    '2024-04-08',
    'Comunidade para negociação de produtos usados em Rondonópolis e região.',
    NULL,
    '78700000',
    'Rondonópolis',
    'MT',
    3
),
(
    'Compra e Venda Olinda',
    '2024-04-09',
    'Comunidade de classificados para moradores de Olinda e cidades próximas.',
    NULL,
    '53020050',
    'Olinda',
    'PE',
    4
),
(
    'Desapega Caruaru',
    '2024-04-10',
    'Comunidade para compra, venda e troca de produtos usados em Caruaru.',
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
(nm_anuncio, descricao, status, tipo_anuncio, cd_usuario_cria)
VALUES
(
    'Notebook Dell Inspiron 15',
    'Notebook Dell Inspiron 15 com processador Intel Core i5, 8 GB de RAM e SSD de 256 GB. Equipamento em bom estado de conservação.',
    'ATIVO',
    'VENDA',
    1
),
(
    'Procuro Headset Gamer com Microfone',
    'Procuro headset gamer com microfone em bom estado, de preferência das marcas HyperX, Logitech ou Redragon.',
    'ATIVO',
    'REQUERIMENTO',
    2
),
(
    'iPhone 13 128 GB Preto',
    'iPhone 13 com 128 GB de armazenamento, cor preta, aparelho conservado e funcionando normalmente.',
    'ATIVO',
    'VENDA',
    3
),
(
    'Procuro Livro Clean Code',
    'Tenho interesse em comprar o livro Clean Code, de Robert C. Martin, novo ou usado em bom estado.',
    'ATIVO',
    'REQUERIMENTO',
    4
),
(
    'Monitor LG 24 Polegadas Full HD',
    'Monitor LG de 24 polegadas, resolução Full HD, entrada HDMI e tela sem riscos.',
    'ATIVO',
    'VENDA',
    2
),
(
    'Teclado Mecânico RGB ABNT2',
    'Teclado mecânico padrão ABNT2, iluminação RGB e switches azuis. Funcionando perfeitamente.',
    'ATIVO',
    'VENDA',
    1
),
(
    'Mouse Logitech G502',
    'Mouse gamer Logitech G502 com fio, sensor de alta precisão e botões programáveis.',
    'ATIVO',
    'VENDA',
    3
),
(
    'SSD Kingston 480 GB SATA',
    'SSD Kingston de 480 GB com conexão SATA. Produto funcionando normalmente e sem erros.',
    'ATIVO',
    'VENDA',
    4
),
(
    'Procuro GTX 1060 ou RX 580',
    'Procuro placa de vídeo GTX 1060 ou RX 580 em bom estado e com funcionamento comprovado.',
    'ATIVO',
    'REQUERIMENTO',
    1
),
(
    'Fone Sony WH-1000XM4',
    'Fone de ouvido Sony WH-1000XM4 com cancelamento de ruído. Pouco utilizado e em ótimo estado.',
    'ATIVO',
    'VENDA',
    2
),
(
    'Procuro Notebook para Estudos',
    'Procuro notebook para estudos e programação, com pelo menos processador Intel Core i5 ou equivalente e 8 GB de RAM.',
    'ATIVO',
    'REQUERIMENTO',
    3
),
(
    'HD Externo Seagate 1 TB',
    'HD externo Seagate de 1 TB, USB 3.0, funcionando normalmente e sem setores defeituosos.',
    'ATIVO',
    'VENDA',
    4
),
(
    'Cadeira Gamer Reclinável',
    'Cadeira gamer preta e vermelha, reclinável, com regulagem de altura e em bom estado de conservação.',
    'ATIVO',
    'VENDA',
    1
),
(
    'Procuro Mesa para Computador',
    'Procuro mesa para computador com pelo menos 1,20 m de largura e espaço suficiente para monitor e gabinete.',
    'ATIVO',
    'REQUERIMENTO',
    2
);


-- =============================================
-- ANÚNCIOS DE VENDA
-- ft_anuncio usa string vazia porque a coluna é NOT NULL
-- =============================================
INSERT INTO tb_anuncio_venda
(cd_anuncio, ft_anuncio, valor)
VALUES
(1, '', 1800.00),
(3, '', 3200.00),
(5, '', 950.00),
(6, '', 280.00),
(7, '', 320.00),
(8, '', 180.00),
(10, '', 1400.00),
(12, '', 220.00),
(13, '', 1100.00);


-- =============================================
-- ANÚNCIOS DE REQUERIMENTO
-- ft_anuncio usa string vazia porque a coluna é NOT NULL
-- =============================================
INSERT INTO tb_anuncio_requerimento
(cd_anuncio, ft_anuncio, valor_min, valor_max)
VALUES
(2, '', 100.00, 200.00),
(4, '', 30.00, 80.00),
(9, '', 400.00, 800.00),
(11, '', 800.00, 2000.00),
(14, '', 150.00, 400.00);


-- =============================================
-- ANÚNCIOS X COMUNIDADES
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
-- USUÁRIOS X COMUNIDADES
-- =============================================
INSERT INTO tb_usuario_comunidade
(cd_usuario, cd_comunidade)
VALUES
(1, 1),
(2, 1),
(3, 2),
(4, 3),
(1, 4);