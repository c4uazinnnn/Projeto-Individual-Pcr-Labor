-- Script para resetar o banco de dados PCR Labor
-- ATENÇÃO: Este script irá APAGAR todos os dados existentes!

-- Dropar tabelas na ordem correta (respeitando foreign keys)
DROP TABLE IF EXISTS SugestaoCompra CASCADE;
DROP TABLE IF EXISTS Venda CASCADE;
DROP TABLE IF EXISTS Produto CASCADE;
DROP TABLE IF EXISTS Usuario CASCADE;
DROP TABLE IF EXISTS Plataforma CASCADE;
DROP TABLE IF EXISTS Empresa CASCADE;

-- Recriar as tabelas com a estrutura correta

-- Tabela de empresas
CREATE TABLE Empresa (
    id_empresa SERIAL PRIMARY KEY,
    nome_fantasia VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de usuários (ligados à empresa)
CREATE TABLE Usuario (
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
CREATE TABLE Plataforma (
    id_plataforma SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos (ligados à empresa)
CREATE TABLE Produto (
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
CREATE TABLE Venda (
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

-- Tabela de sugestões de compra
CREATE TABLE SugestaoCompra (
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
('PCR Labor', '12.345.678/0001-90');

-- Plataformas
INSERT INTO Plataforma (nome) VALUES 
('Mercado Livre'),
('Shopee'),
('Site Próprio');

-- Usuário administrador (senha: admin123)
INSERT INTO Usuario (nome, email, senha_hash, id_empresa) VALUES 
('Administrador', 'admin@pcrlabor.com', '$2b$10$rOvHPxfzO2.KjB8YVnKzUeJ8qF5YyJ5YyJ5YyJ5YyJ5YyJ5YyJ5Y', 1);

-- Produtos de exemplo
INSERT INTO Produto (id_empresa, nome, sku, preco, estoque_atual) VALUES 
(1, 'Kit PCR COVID-19', 'PCR-COVID-001', 89.90, 150),
(1, 'Kit PCR Influenza', 'PCR-FLU-001', 79.90, 200),
(1, 'Kit PCR Hepatite B', 'PCR-HEP-001', 95.50, 100),
(1, 'Kit PCR Dengue', 'PCR-DEN-001', 85.00, 5),
(1, 'Kit PCR Zika', 'PCR-ZIK-001', 92.50, 75);

-- Vendas de exemplo
INSERT INTO Venda (id_produto, id_plataforma, quantidade, data, valor_total) VALUES 
(1, 1, 10, '2025-01-01', 899.00),
(1, 2, 5, '2025-01-02', 449.50),
(2, 1, 8, '2025-01-03', 639.20),
(3, 3, 3, '2025-01-04', 286.50),
(4, 2, 2, '2025-01-05', 170.00),
(5, 1, 4, '2025-01-06', 370.00);

-- Sugestões de compra
INSERT INTO SugestaoCompra (id_produto, quantidade_sugerida, data_gerada, status) VALUES 
(1, 50, CURRENT_DATE, 'pendente'),
(2, 75, CURRENT_DATE, 'pendente'),
(3, 30, CURRENT_DATE, 'aprovada'),
(4, 100, CURRENT_DATE, 'pendente'),
(5, 25, CURRENT_DATE, 'pendente');
