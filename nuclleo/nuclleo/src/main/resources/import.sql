-- Usuários
INSERT INTO tb_usuario (nm_usuario, ft_usuario, email, senha, dt_entrada, cpf, cep, telefone) VALUES ('Gustavo Ferreira', null, 'gustavo', '123', '2024-01-10', '111.111.111-11', '35180-000', '(31) 99999-1111');
INSERT INTO tb_usuario (nm_usuario, ft_usuario, email, senha, dt_entrada, cpf, cep, telefone) VALUES ('Ana Souza', null, 'ana', '123', '2024-02-15', '222.222.222-22', '35180-001', '(31) 99999-2222');
INSERT INTO tb_usuario (nm_usuario, ft_usuario, email, senha, dt_entrada, cpf, cep, telefone) VALUES ('Pedro Lima', null, 'pedro', '123', '2024-03-20', '333.333.333-33', '35180-002', '(31) 99999-3333');
INSERT INTO tb_usuario (nm_usuario, ft_usuario, email, senha, dt_entrada, cpf, cep, telefone) VALUES ('Julia Mendes', null, 'julia', '123', '2024-04-05', '444.444.444-44', '35180-003', '(31) 99999-4444');

-- Comunidades (criadas pelos usuários acima)
INSERT INTO tb_comunidade (nm_comunidade, dt_criacao, descricao, cd_usuario_cria) VALUES ('Tecnologia CEFET', '2024-01-15', 'Comunidade sobre tecnologia e desenvolvimento de software', 1);
INSERT INTO tb_comunidade (nm_comunidade, dt_criacao, descricao, cd_usuario_cria) VALUES ('Marketplace Geral', '2024-02-20', 'Compra e venda de produtos em geral', 2);
INSERT INTO tb_comunidade (nm_comunidade, dt_criacao, descricao, cd_usuario_cria) VALUES ('Eletrônicos Usados', '2024-03-10', 'Anúncios de eletrônicos seminovos', 3);
INSERT INTO tb_comunidade (nm_comunidade, dt_criacao, descricao, cd_usuario_cria) VALUES ('Livros e Cursos', '2024-04-01', 'Troca e venda de livros e materiais de estudo', 4);

-- Anúncios base (tb_Anuncio)
INSERT INTO tb_anuncio (nm_anuncio, descricao, habilitado, tipo_anuncio, cd_usuario_cria) VALUES ('Notebook Dell i5', 'Notebook Dell em ótimo estado, 8GB RAM', 1, 'VENDA', 1);
INSERT INTO tb_anuncio (nm_anuncio, descricao, habilitado, tipo_anuncio, cd_usuario_cria) VALUES ('Procuro Headset Gamer', 'Busco headset gamer com microfone até R$200', 1, 'REQUERIMENTO', 2);
INSERT INTO tb_anuncio (nm_anuncio, descricao, habilitado, tipo_anuncio, cd_usuario_cria) VALUES ('iPhone 13 128GB', 'iPhone 13 128GB, cor preta, pouco uso', 1, 'VENDA', 3);
INSERT INTO tb_anuncio (nm_anuncio, descricao, habilitado, tipo_anuncio, cd_usuario_cria) VALUES ('Procuro Livro Clean Code', 'Busco livro Clean Code do Robert Martin', 1, 'REQUERIMENTO', 4);
-- Anúncios base adicionais (tb_Anuncio)
INSERT INTO tb_anuncio (nm_anuncio, descricao, habilitado, tipo_anuncio, cd_usuario_cria) VALUES ('Monitor LG 24"', 'Monitor LG 24 polegadas Full HD, HDMI, sem riscos', 1, 'VENDA', 2);
INSERT INTO tb_anuncio (nm_anuncio, descricao, habilitado, tipo_anuncio, cd_usuario_cria) VALUES ('Teclado Mecânico', 'Teclado mecânico switch azul, RGB, ABNT2', 1, 'VENDA', 1);
INSERT INTO tb_anuncio (nm_anuncio, descricao, habilitado, tipo_anuncio, cd_usuario_cria) VALUES ('Mouse Gamer Logitech', 'Mouse Logitech G502, 16000 DPI, com fio', 1, 'VENDA', 3);
INSERT INTO tb_anuncio (nm_anuncio, descricao, habilitado, tipo_anuncio, cd_usuario_cria) VALUES ('SSD 480GB Kingston', 'SSD Kingston 480GB SATA, funcionando perfeitamente', 1, 'VENDA', 4);
INSERT INTO tb_anuncio (nm_anuncio, descricao, habilitado, tipo_anuncio, cd_usuario_cria) VALUES ('Procuro Placa de Vídeo', 'Busco GTX 1060 ou RX 580, aceito propostas', 1, 'REQUERIMENTO', 1);
INSERT INTO tb_anuncio (nm_anuncio, descricao, habilitado, tipo_anuncio, cd_usuario_cria) VALUES ('Fone Sony WH-1000XM4', 'Fone com cancelamento de ruído, pouco uso, na caixa', 1, 'VENDA', 2);
INSERT INTO tb_anuncio (nm_anuncio, descricao, habilitado, tipo_anuncio, cd_usuario_cria) VALUES ('Procuro Notebook até 2000', 'Busco notebook para estudos, mínimo i5 e 8GB RAM', 1, 'REQUERIMENTO', 3);
INSERT INTO tb_anuncio (nm_anuncio, descricao, habilitado, tipo_anuncio, cd_usuario_cria) VALUES ('HD Externo 1TB Seagate', 'HD externo 1TB USB 3.0, sem bad sectors', 1, 'VENDA', 4);
INSERT INTO tb_anuncio (nm_anuncio, descricao, habilitado, tipo_anuncio, cd_usuario_cria) VALUES ('Cadeira Gamer DXRacer', 'Cadeira gamer preta e vermelha, reclinável, ótimo estado', 1, 'VENDA', 1);
INSERT INTO tb_anuncio (nm_anuncio, descricao, habilitado, tipo_anuncio, cd_usuario_cria) VALUES ('Procuro Mesa para PC', 'Busco mesa para setup gamer, mínimo 1.20m de largura', 1, 'REQUERIMENTO', 2);

-- AnuncioVenda (herda de Anuncio, JOINED)
INSERT INTO tb_anuncio_venda (cd_anuncio, ft_anuncio, valor) VALUES (1, 'notebook_dell.jpg', 1800.00);
INSERT INTO tb_anuncio_venda (cd_anuncio, ft_anuncio, valor) VALUES (3, 'iphone13.jpg', 3200.00);
INSERT INTO tb_anuncio_venda (cd_anuncio, ft_anuncio, valor) VALUES (5, 'monitor_lg.jpg', 950.00);
INSERT INTO tb_anuncio_venda (cd_anuncio, ft_anuncio, valor) VALUES (6, 'teclado_mecanico.jpg', 280.00);
INSERT INTO tb_anuncio_venda (cd_anuncio, ft_anuncio, valor) VALUES (7, 'mouse_logitech.jpg', 320.00);
INSERT INTO tb_anuncio_venda (cd_anuncio, ft_anuncio, valor) VALUES (8, 'ssd_kingston.jpg', 180.00);
INSERT INTO tb_anuncio_venda (cd_anuncio, ft_anuncio, valor) VALUES (10, 'fone_sony.jpg', 1400.00);
INSERT INTO tb_anuncio_venda (cd_anuncio, ft_anuncio, valor) VALUES (12, 'hd_externo.jpg', 220.00);
INSERT INTO tb_anuncio_venda (cd_anuncio, ft_anuncio, valor) VALUES (13, 'cadeira_dxracer.jpg', 1100.00);

-- AnuncioRequerimento (herda de Anuncio, JOINED)
INSERT INTO tb_anuncio_requerimento (cd_anuncio, ft_anuncio, valor_min, valor_max) VALUES (2, null, 100.00, 200.00);
INSERT INTO tb_anuncio_requerimento (cd_anuncio, ft_anuncio, valor_min, valor_max) VALUES (4, null, 30.00, 80.00);
INSERT INTO tb_anuncio_requerimento (cd_anuncio, ft_anuncio, valor_min, valor_max) VALUES (9, null, 400.00, 800.00);
INSERT INTO tb_anuncio_requerimento (cd_anuncio, ft_anuncio, valor_min, valor_max) VALUES (11, null, 800.00, 2000.00);
INSERT INTO tb_anuncio_requerimento (cd_anuncio, ft_anuncio, valor_min, valor_max) VALUES (14, null, 150.00, 400.00);

-- AnuncioComunidade (vincula anúncios a comunidades)
INSERT INTO tb_anuncio_comunidade (cd_anuncio, cd_comunidade) VALUES (1, 1);
INSERT INTO tb_anuncio_comunidade (cd_anuncio, cd_comunidade) VALUES (1, 3);
INSERT INTO tb_anuncio_comunidade (cd_anuncio, cd_comunidade) VALUES (2, 3);
INSERT INTO tb_anuncio_comunidade (cd_anuncio, cd_comunidade) VALUES (3, 2);
INSERT INTO tb_anuncio_comunidade (cd_anuncio, cd_comunidade) VALUES (4, 4);

-- UsuarioComunidade (vincula usuários a comunidades)
INSERT INTO tb_usuario_comunidade (cd_usuario, cd_comunidade) VALUES (1, 1);
INSERT INTO tb_usuario_comunidade (cd_usuario, cd_comunidade) VALUES (2, 1);
INSERT INTO tb_usuario_comunidade (cd_usuario, cd_comunidade) VALUES (3, 2);
INSERT INTO tb_usuario_comunidade (cd_usuario, cd_comunidade) VALUES (4, 3);
INSERT INTO tb_usuario_comunidade (cd_usuario, cd_comunidade) VALUES (1, 4);
INSERT INTO tb_anuncio_comunidade (cd_anuncio, cd_comunidade) VALUES (5, 3);
INSERT INTO tb_anuncio_comunidade (cd_anuncio, cd_comunidade) VALUES (6, 1);
INSERT INTO tb_anuncio_comunidade (cd_anuncio, cd_comunidade) VALUES (7, 3);
INSERT INTO tb_anuncio_comunidade (cd_anuncio, cd_comunidade) VALUES (8, 1);
INSERT INTO tb_anuncio_comunidade (cd_anuncio, cd_comunidade) VALUES (9, 3);
INSERT INTO tb_anuncio_comunidade (cd_anuncio, cd_comunidade) VALUES (10, 2);
INSERT INTO tb_anuncio_comunidade (cd_anuncio, cd_comunidade) VALUES (11, 1);
INSERT INTO tb_anuncio_comunidade (cd_anuncio, cd_comunidade) VALUES (12, 2);
INSERT INTO tb_anuncio_comunidade (cd_anuncio, cd_comunidade) VALUES (13, 2);
INSERT INTO tb_anuncio_comunidade (cd_anuncio, cd_comunidade) VALUES (14, 2);