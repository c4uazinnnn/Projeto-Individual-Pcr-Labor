-- Criação do schema
CREATE DATABASE IF NOT EXISTS bd_pcr_labor;
USE bd_pcr_labor;

-- Tabela de empresas
CREATE TABLE Empresa (
    id_empresa INT PRIMARY KEY AUTO_INCREMENT,
    nome_fantasia VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL
);

-- Tabela de usuários (ligados à empresa)
CREATE TABLE Usuario (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    id_empresa INT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa)
);

-- Tabela de plataformas (ex: Shopee, Mercado Livre)
CREATE TABLE Plataforma (
    id_plataforma INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL
);

-- Tabela de produtos (ligados à empresa)
CREATE TABLE Produto (
    id_produto INT PRIMARY KEY AUTO_INCREMENT,
    id_empresa INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    estoque_atual INT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa)
);

-- Tabela de vendas
CREATE TABLE Venda (
    id_venda INT PRIMARY KEY AUTO_INCREMENT,
    id_produto INT NOT NULL,
    id_plataforma INT NOT NULL,
    quantidade INT NOT NULL,
    data DATE NOT NULL,
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto),
    FOREIGN KEY (id_plataforma) REFERENCES Plataforma(id_plataforma)
);

-- Tabela de sugestões de compra
CREATE TABLE SugestaoCompra (
    id_sugestao INT PRIMARY KEY AUTO_INCREMENT,
    id_produto INT NOT NULL,
    quantidade_sugerida INT NOT NULL,
    data_gerada DATE NOT NULL,
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto)