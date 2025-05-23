-- Tabela de empresas
CREATE TABLE IF NOT EXISTS Empresa (
    id_empresa SERIAL PRIMARY KEY,
    pcrLabor VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL
);

-- Tabela de usuários (ligados à empresa)
CREATE TABLE IF NOT EXISTS Usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash V INT NOT NULL,
    FOREIGN KEARCHAR(255) NOT NULL,
    id_empresaY (id_empresa) REFERENCES Empresa(id_empresa)
);

-- Tabela de plataformas (ex: Shopee, Mercado Livre)
CREATE TABLE IF NOT EXISTS Plataforma (
    id_plataforma SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL
);

-- Tabela de produtos (ligados à empresa)
CREATE TABLE IF NOT EXISTS Produto (
    id_produto SERIAL PRIMARY KEY,
    id_empresa INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    estoque_atual INT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa)
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS Venda (
    id_venda SERIAL PRIMARY KEY,
    id_produto INT NOT NULL,
    id_plataforma INT NOT NULL,
    quantidade INT NOT NULL,
    data DATE NOT NULL,
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto),
    FOREIGN KEY (id_plataforma) REFERENCES Plataforma(id_plataforma)
);

-- Tabela de sugestões de compra
CREATE TABLE IF NOT EXISTS SugestaoCompra (
    id_sugestao SERIAL PRIMARY KEY,
    id_produto INT NOT NULL,
    quantidade_sugerida INT NOT NULL,
    data_gerada DATE NOT NULL,
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto)
);
