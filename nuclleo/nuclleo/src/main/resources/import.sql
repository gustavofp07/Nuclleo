TRUNCATE TABLE
    tb_usuario,
    tb_comunidade,
    tb_anuncio,
    tb_anuncio_venda,
    tb_anuncio_requerimento,
    tb_anuncio_comunidade,
    tb_usuario_comunidade,
    interesse,
    transacao,
    avaliacao
RESTART IDENTITY CASCADE;


-- =============================================
-- USUÁRIOS
-- =============================================

INSERT INTO tb_usuario
(nm_usuario, ft_usuario, email, senha, dt_entrada, cpf, cep, telefone, ativo)
VALUES
('Gustavo Ferreira', NULL, 'gustavo', '123', '2024-01-10',
 '111.111.111-11', '35180-000', '(31) 99999-1111', TRUE),

('Ana Souza', NULL, 'ana', '123', '2024-02-15',
 '222.222.222-22', '35180-001', '(31) 99999-2222', TRUE),

('Pedro Lima', NULL, 'pedro', '123', '2024-03-20',
 '333.333.333-33', '35180-002', '(31) 99999-3333', TRUE),

('Julia Mendes', NULL, 'julia', '123', '2024-04-05',
 '444.444.444-44', '35180-003', '(31) 99999-4444', TRUE);


-- =============================================
-- COMUNIDADES
-- =============================================

INSERT INTO tb_comunidade
(nm_comunidade, dt_criacao, descricao, cd_usuario_cria)
VALUES
('Tecnologia CEFET', '2024-01-15',
 'Comunidade sobre tecnologia e desenvolvimento de software', 1),

('Marketplace Geral', '2024-02-20',
 'Compra e venda de produtos em geral', 2),

('Eletrônicos Usados', '2024-03-10',
 'Anúncios de eletrônicos seminovos', 3),

('Livros e Cursos', '2024-04-01',
 'Troca e venda de livros e materiais de estudo', 4);


-- =============================================
-- ANÚNCIOS
-- =============================================

INSERT INTO tb_anuncio
(nm_anuncio, descricao, habilitado, tipo_anuncio, cd_usuario_cria)
VALUES
('Notebook Dell i5',
 'Notebook Dell em ótimo estado, 8GB RAM',
 TRUE, 'VENDA', 1),

('Procuro Headset Gamer',
 'Busco headset gamer com microfone até R$200',
 TRUE, 'REQUERIMENTO', 2),

('iPhone 13 128GB',
 'iPhone 13 128GB, cor preta, pouco uso',
 TRUE, 'VENDA', 3),

('Procuro Livro Clean Code',
 'Busco livro Clean Code do Robert Martin',
 TRUE, 'REQUERIMENTO', 4),

('Monitor LG 24"',
 'Monitor LG 24 polegadas Full HD, HDMI, sem riscos',
 TRUE, 'VENDA', 2),

('Teclado Mecânico',
 'Teclado mecânico switch azul, RGB, ABNT2',
 TRUE, 'VENDA', 1),

('Mouse Gamer Logitech',
 'Mouse Logitech G502, 16000 DPI, com fio',
 TRUE, 'VENDA', 3),

('SSD 480GB Kingston',
 'SSD Kingston 480GB SATA, funcionando perfeitamente',
 TRUE, 'VENDA', 4),

('Procuro Placa de Vídeo',
 'Busco GTX 1060 ou RX 580, aceito propostas',
 TRUE, 'REQUERIMENTO', 1),

('Fone Sony WH-1000XM4',
 'Fone com cancelamento de ruído, pouco uso, na caixa',
 TRUE, 'VENDA', 2),

('Procuro Notebook até 2000',
 'Busco notebook para estudos, mínimo i5 e 8GB RAM',
 TRUE, 'REQUERIMENTO', 3),

('HD Externo 1TB Seagate',
 'HD externo 1TB USB 3.0, sem bad sectors',
 TRUE, 'VENDA', 4),

('Cadeira Gamer DXRacer',
 'Cadeira gamer preta e vermelha, reclinável, ótimo estado',
 TRUE, 'VENDA', 1),

('Procuro Mesa para PC',
 'Busco mesa para setup gamer, mínimo 1.20m de largura',
 TRUE, 'REQUERIMENTO', 2);


-- =============================================
-- ANÚNCIOS DE VENDA
-- =============================================

INSERT INTO tb_anuncio_venda
(cd_anuncio, ft_anuncio, valor)
VALUES
(1, 'notebook_dell.jpg', 1800.00),
(3, 'iphone13.jpg', 3200.00),
(5, 'monitor_lg.jpg', 950.00),
(6, 'teclado_mecanico.jpg', 280.00),
(7, 'mouse_logitech.jpg', 320.00),
(8, 'ssd_kingston.jpg', 180.00),
(10, 'fone_sony.jpg', 1400.00),
(12, 'hd_externo.jpg', 220.00),
(13, 'cadeira_dxracer.jpg', 1100.00);


-- =============================================
-- ANÚNCIOS DE REQUERIMENTO
-- =============================================

INSERT INTO tb_anuncio_requerimento
(cd_anuncio, ft_anuncio, valor_min, valor_max)
VALUES
(2, NULL, 100.00, 200.00),
(4, NULL, 30.00, 80.00),
(9, NULL, 400.00, 800.00),
(11, NULL, 800.00, 2000.00),
(14, NULL, 150.00, 400.00);


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