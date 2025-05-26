-- =====================================================
-- MELHORIAS NO BANCO DE DADOS PCR LABOR
-- =====================================================

-- 1. MELHORAR TABELA EMPRESA
-- Adicionar mais campos importantes para empresas
ALTER TABLE Empresa ADD COLUMN IF NOT EXISTS razao_social VARCHAR(150);
ALTER TABLE Empresa ADD COLUMN IF NOT EXISTS endereco TEXT;
ALTER TABLE Empresa ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);
ALTER TABLE Empresa ADD COLUMN IF NOT EXISTS email VARCHAR(100);
ALTER TABLE Empresa ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;

-- 2. MELHORAR TABELA USUARIO
-- Adicionar campos que foram removidos + novos campos importantes
ALTER TABLE Usuario ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);
ALTER TABLE Usuario ADD COLUMN IF NOT EXISTS cargo VARCHAR(50);
ALTER TABLE Usuario ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE Usuario ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE Usuario ADD COLUMN IF NOT EXISTS ultimo_login TIMESTAMP;
ALTER TABLE Usuario ADD COLUMN IF NOT EXISTS nivel_acesso VARCHAR(20) DEFAULT 'usuario'; -- admin, gerente, usuario

-- 3. MELHORAR TABELA PRODUTO
-- Adicionar campos importantes para gestão de produtos
ALTER TABLE Produto ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE Produto ADD COLUMN IF NOT EXISTS categoria VARCHAR(50);
ALTER TABLE Produto ADD COLUMN IF NOT EXISTS estoque_minimo INTEGER DEFAULT 10;
ALTER TABLE Produto ADD COLUMN IF NOT EXISTS estoque_maximo INTEGER DEFAULT 1000;
ALTER TABLE Produto ADD COLUMN IF NOT EXISTS custo DECIMAL(10,2);
ALTER TABLE Produto ADD COLUMN IF NOT EXISTS margem_lucro DECIMAL(5,2) DEFAULT 30.00;
ALTER TABLE Produto ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true;
ALTER TABLE Produto ADD COLUMN IF NOT EXISTS codigo_barras VARCHAR(50);

-- 4. NOVA TABELA: FORNECEDORES
CREATE TABLE IF NOT EXISTS Fornecedor (
    id_fornecedor SERIAL PRIMARY KEY,
    id_empresa INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18),
    telefone VARCHAR(20),
    email VARCHAR(100),
    endereco TEXT,
    contato_principal VARCHAR(100),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE
);

-- 5. NOVA TABELA: PRODUTOS_FORNECEDORES (relacionamento N:N)
CREATE TABLE IF NOT EXISTS ProdutoFornecedor (
    id_produto_fornecedor SERIAL PRIMARY KEY,
    id_produto INTEGER NOT NULL,
    id_fornecedor INTEGER NOT NULL,
    preco_fornecedor DECIMAL(10,2),
    tempo_entrega_dias INTEGER DEFAULT 7,
    quantidade_minima INTEGER DEFAULT 1,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto) ON DELETE CASCADE,
    FOREIGN KEY (id_fornecedor) REFERENCES Fornecedor(id_fornecedor) ON DELETE CASCADE,
    UNIQUE(id_produto, id_fornecedor)
);

-- 6. NOVA TABELA: PEDIDOS DE COMPRA
CREATE TABLE IF NOT EXISTS PedidoCompra (
    id_pedido SERIAL PRIMARY KEY,
    id_empresa INTEGER NOT NULL,
    id_fornecedor INTEGER NOT NULL,
    numero_pedido VARCHAR(50) UNIQUE NOT NULL,
    data_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
    data_entrega_prevista DATE,
    data_entrega_real DATE,
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pendente', -- pendente, enviado, entregue, cancelado
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE,
    FOREIGN KEY (id_fornecedor) REFERENCES Fornecedor(id_fornecedor) ON DELETE CASCADE
);

-- 7. NOVA TABELA: ITENS DO PEDIDO DE COMPRA
CREATE TABLE IF NOT EXISTS ItemPedidoCompra (
    id_item SERIAL PRIMARY KEY,
    id_pedido INTEGER NOT NULL,
    id_produto INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pedido) REFERENCES PedidoCompra(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto) ON DELETE CASCADE
);

-- 8. NOVA TABELA: MOVIMENTAÇÃO DE ESTOQUE
CREATE TABLE IF NOT EXISTS MovimentacaoEstoque (
    id_movimentacao SERIAL PRIMARY KEY,
    id_produto INTEGER NOT NULL,
    tipo VARCHAR(20) NOT NULL, -- entrada, saida, ajuste, venda
    quantidade INTEGER NOT NULL,
    quantidade_anterior INTEGER NOT NULL,
    quantidade_atual INTEGER NOT NULL,
    motivo VARCHAR(100),
    id_referencia INTEGER, -- ID da venda, pedido, etc.
    tipo_referencia VARCHAR(20), -- venda, pedido_compra, ajuste
    id_usuario INTEGER,
    data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE SET NULL
);

-- 9. MELHORAR TABELA VENDA
-- Adicionar campos importantes para vendas
ALTER TABLE Venda ADD COLUMN IF NOT EXISTS id_empresa INTEGER;
ALTER TABLE Venda ADD COLUMN IF NOT EXISTS numero_venda VARCHAR(50);
ALTER TABLE Venda ADD COLUMN IF NOT EXISTS preco_unitario DECIMAL(10,2);
ALTER TABLE Venda ADD COLUMN IF NOT EXISTS desconto DECIMAL(10,2) DEFAULT 0;
ALTER TABLE Venda ADD COLUMN IF NOT EXISTS taxa_plataforma DECIMAL(5,2) DEFAULT 0;
ALTER TABLE Venda ADD COLUMN IF NOT EXISTS valor_liquido DECIMAL(10,2);
ALTER TABLE Venda ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'confirmada';
ALTER TABLE Venda ADD COLUMN IF NOT EXISTS id_usuario INTEGER;

-- Adicionar foreign keys para os novos campos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'venda_empresa_fk'
    ) THEN
        ALTER TABLE Venda ADD CONSTRAINT venda_empresa_fk 
        FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'venda_usuario_fk'
    ) THEN
        ALTER TABLE Venda ADD CONSTRAINT venda_usuario_fk 
        FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE SET NULL;
    END IF;
END $$;

-- 10. NOVA TABELA: CONFIGURAÇÕES DA EMPRESA
CREATE TABLE IF NOT EXISTS ConfiguracaoEmpresa (
    id_configuracao SERIAL PRIMARY KEY,
    id_empresa INTEGER NOT NULL,
    chave VARCHAR(50) NOT NULL,
    valor TEXT,
    descricao VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE,
    UNIQUE(id_empresa, chave)
);

-- 11. NOVA TABELA: LOGS DE AUDITORIA
CREATE TABLE IF NOT EXISTS LogAuditoria (
    id_log SERIAL PRIMARY KEY,
    id_empresa INTEGER NOT NULL,
    id_usuario INTEGER,
    tabela VARCHAR(50) NOT NULL,
    operacao VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    id_registro INTEGER,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE SET NULL
);

-- 12. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_produto_empresa ON Produto(id_empresa);
CREATE INDEX IF NOT EXISTS idx_venda_empresa ON Venda(id_empresa);
CREATE INDEX IF NOT EXISTS idx_venda_data ON Venda(data);
CREATE INDEX IF NOT EXISTS idx_venda_produto ON Venda(id_produto);
CREATE INDEX IF NOT EXISTS idx_movimentacao_produto ON MovimentacaoEstoque(id_produto);
CREATE INDEX IF NOT EXISTS idx_movimentacao_data ON MovimentacaoEstoque(data_movimentacao);
CREATE INDEX IF NOT EXISTS idx_usuario_empresa ON Usuario(id_empresa);
CREATE INDEX IF NOT EXISTS idx_fornecedor_empresa ON Fornecedor(id_empresa);
CREATE INDEX IF NOT EXISTS idx_pedido_empresa ON PedidoCompra(id_empresa);

-- 13. ATUALIZAR DADOS EXISTENTES
-- Atualizar vendas existentes com id_empresa baseado no produto
UPDATE Venda SET id_empresa = (
    SELECT p.id_empresa 
    FROM Produto p 
    WHERE p.id_produto = Venda.id_produto
) WHERE id_empresa IS NULL;

-- Gerar números de venda únicos
UPDATE Venda SET numero_venda = 'V' || LPAD(id_venda::text, 6, '0') 
WHERE numero_venda IS NULL;

-- Calcular preço unitário onde não existe
UPDATE Venda SET preco_unitario = ROUND(valor_total / quantidade, 2) 
WHERE preco_unitario IS NULL AND quantidade > 0;

-- Calcular valor líquido (assumindo 5% de taxa da plataforma)
UPDATE Venda SET 
    taxa_plataforma = 5.00,
    valor_liquido = ROUND(valor_total * 0.95, 2)
WHERE valor_liquido IS NULL;

-- 14. INSERIR CONFIGURAÇÕES PADRÃO
INSERT INTO ConfiguracaoEmpresa (id_empresa, chave, valor, descricao) VALUES
(1, 'estoque_minimo_global', '10', 'Estoque mínimo padrão para novos produtos'),
(1, 'margem_lucro_padrao', '30.00', 'Margem de lucro padrão em %'),
(1, 'dias_alerta_vencimento', '30', 'Dias antes do vencimento para alertar'),
(1, 'email_alertas', 'admin@pcrlabor.com', 'Email para receber alertas do sistema')
ON CONFLICT (id_empresa, chave) DO NOTHING;

-- 15. INSERIR DADOS DE EXEMPLO PARA DEMONSTRAÇÃO
-- Fornecedores de exemplo
INSERT INTO Fornecedor (id_empresa, nome, cnpj, telefone, email, contato_principal) VALUES
(1, 'BioTech Suprimentos LTDA', '98.765.432/0001-10', '(11) 3333-4444', 'vendas@biotech.com', 'Carlos Silva'),
(1, 'MedLab Distribuidora', '87.654.321/0001-20', '(11) 5555-6666', 'comercial@medlab.com', 'Ana Santos')
ON CONFLICT DO NOTHING;

-- Relacionar produtos com fornecedores
INSERT INTO ProdutoFornecedor (id_produto, id_fornecedor, preco_fornecedor, tempo_entrega_dias, quantidade_minima) VALUES
(1, 1, 65.00, 5, 50),
(2, 1, 55.00, 5, 50),
(3, 2, 70.00, 7, 30),
(1, 2, 68.00, 10, 25)
ON CONFLICT (id_produto, id_fornecedor) DO NOTHING;
