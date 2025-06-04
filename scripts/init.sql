-- Tabela de empresas
CREATE TABLE IF NOT EXISTS Empresa (
    id_empresa SERIAL PRIMARY KEY,
    nome_fantasia VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de usuários (ligados à empresa)
CREATE TABLE IF NOT EXISTS Usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    id_empresa INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE
);

-- Tabela de plataformas (ex: Shopee, Mercado Livre)
CREATE TABLE IF NOT EXISTS Plataforma (
    id_plataforma SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos (ligados à empresa)
CREATE TABLE IF NOT EXISTS Produto (
    id_produto SERIAL PRIMARY KEY,
    id_empresa INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    estoque_atual INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS Venda (
    id_venda SERIAL PRIMARY KEY,
    id_produto INTEGER NOT NULL,
    id_plataforma INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    data DATE NOT NULL,
    valor_total DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto) ON DELETE CASCADE,
    FOREIGN KEY (id_plataforma) REFERENCES Plataforma(id_plataforma) ON DELETE CASCADE
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS Pedido (
    id_pedido SERIAL PRIMARY KEY,
    id_produto INTEGER NOT NULL,
    id_plataforma INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDENTE',
    data_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
    valor_total DECIMAL(10,2),
    fornecedor VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto) ON DELETE CASCADE,
    FOREIGN KEY (id_plataforma) REFERENCES Plataforma(id_plataforma) ON DELETE CASCADE
);

-- Tabela de sugestões de compra
CREATE TABLE IF NOT EXISTS SugestaoCompra (
    id_sugestao SERIAL PRIMARY KEY,
    id_produto INTEGER NOT NULL,
    quantidade_sugerida INTEGER NOT NULL,
    data_gerada DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto) ON DELETE CASCADE
);

-- Inserção de dados de exemplo
-- Empresa
INSERT INTO Empresa (nome_fantasia, cnpj) VALUES
('PCR Labor', '12.345.678/0001-90')
ON CONFLICT (cnpj) DO NOTHING;

-- Plataformas
INSERT INTO Plataforma (nome) VALUES
('Mercado Livre'),
('Shopee'),
('Site Próprio')
ON CONFLICT (nome) DO NOTHING;

-- Usuário administrador (senha: admin123)
INSERT INTO Usuario (nome, email, senha_hash, id_empresa) VALUES
('Administrador', 'admin@pcrlabor.com', '$2b$10$rOvHPxfzO2.KjB8YVnKzUeJ8qF5YyJ5YyJ5YyJ5YyJ5YyJ5YyJ5Y', 1)
ON CONFLICT (email) DO NOTHING;

-- Produtos de exemplo
INSERT INTO Produto (id_empresa, nome, sku, preco, estoque_atual) VALUES
(1, 'Kit PCR COVID-19', 'PCR-COVID-001', 89.90, 150),
(1, 'Kit PCR Influenza', 'PCR-FLU-001', 79.90, 200),
(1, 'Kit PCR Hepatite B', 'PCR-HEP-001', 95.50, 100)
ON CONFLICT (sku) DO NOTHING;

-- Vendas de exemplo
INSERT INTO Venda (id_produto, id_plataforma, quantidade, data, valor_total) VALUES
(1, 1, 10, '2025-01-01', 899.00),
(1, 2, 5, '2025-01-02', 449.50),
(2, 1, 8, '2025-01-03', 639.20),
(3, 3, 3, '2025-01-04', 286.50);

-- Pedidos de exemplo com datas variadas
INSERT INTO Pedido (id_produto, id_plataforma, quantidade, status, data_pedido, valor_total, fornecedor) VALUES
-- Pedidos de hoje
(1, 1, 50, 'PENDENTE', CURRENT_DATE, 4495.00, 'BioTech LTDA'),
(2, 2, 30, 'APROVADO', CURRENT_DATE, 2397.00, 'MedLab Supply'),
-- Pedidos dos últimos 7 dias
(3, 1, 25, 'PENDENTE', CURRENT_DATE - INTERVAL '1 day', 2387.50, 'Diagnósticos S.A.'),
(1, 3, 40, 'APROVADO', CURRENT_DATE - INTERVAL '2 days', 3596.00, 'PCR Labor'),
(2, 2, 20, 'ENTREGUE', CURRENT_DATE - INTERVAL '3 days', 1598.00, 'BioTech LTDA'),
-- Pedidos deste mês
(3, 1, 60, 'ENTREGUE', CURRENT_DATE - INTERVAL '10 days', 4794.00, 'PCR Labor'),
(1, 2, 45, 'PENDENTE', CURRENT_DATE - INTERVAL '15 days', 4297.50, 'BioTech LTDA'),
-- Pedidos de meses anteriores
(2, 3, 80, 'ENTREGUE', CURRENT_DATE - INTERVAL '35 days', 7640.00, 'PCR Labor'),
(3, 1, 55, 'ENTREGUE', CURRENT_DATE - INTERVAL '45 days', 4944.50, 'MedLab Supply');

-- Sugestões de compra
INSERT INTO SugestaoCompra (id_produto, quantidade_sugerida, data_gerada, status) VALUES
(1, 50, CURRENT_DATE, 'pendente'),
(2, 75, CURRENT_DATE, 'pendente'),
(3, 30, CURRENT_DATE, 'aprovada');
