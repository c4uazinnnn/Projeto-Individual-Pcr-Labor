-- Tabela de Empresas
CREATE TABLE IF NOT EXISTS Empresa (
    id_empresa SERIAL PRIMARY KEY,
    nome_fantasia VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários (ligados à empresa)
CREATE TABLE IF NOT EXISTS Usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cargo VARCHAR(100),
    avatar VARCHAR(255),
    id_empresa INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE
);

-- Tabela de Plataformas (ex: Shopee, Mercado Livre)
CREATE TABLE IF NOT EXISTS Plataforma (
    id_plataforma SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Produtos (ligados à empresa)
CREATE TABLE IF NOT EXISTS Produto (
    id_produto SERIAL PRIMARY KEY,
    id_empresa INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    preco_base DECIMAL(10,2) DEFAULT 0,
    custo_frete DECIMAL(10,2) DEFAULT 0,
    estoque_atual INTEGER NOT NULL DEFAULT 0,
    estoque_minimo INTEGER DEFAULT 10,
    categoria VARCHAR(50),
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE
);

-- Tabela de Vendas
CREATE TABLE IF NOT EXISTS Venda (
    id_venda SERIAL PRIMARY KEY,
    id_produto INTEGER NOT NULL,
    id_plataforma INTEGER NOT NULL,
    id_empresa INTEGER,
    quantidade INTEGER NOT NULL,
    data DATE NOT NULL,
    valor_total DECIMAL(10,2),
    numero_venda VARCHAR(50),
    preco_unitario DECIMAL(10,2),
    desconto DECIMAL(10,2) DEFAULT 0,
    taxa_plataforma DECIMAL(5,2) DEFAULT 0,
    valor_liquido DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'confirmada',
    id_usuario INTEGER,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto) ON DELETE CASCADE,
    FOREIGN KEY (id_plataforma) REFERENCES Plataforma(id_plataforma) ON DELETE CASCADE,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE SET NULL
);

-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS Pedido (
    id_pedido SERIAL PRIMARY KEY,
    id_produto INTEGER NOT NULL,
    id_plataforma INTEGER NOT NULL,
    id_empresa INTEGER,
    id_fornecedor INTEGER,
    quantidade INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDENTE',
    data_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
    data_entrega DATE,
    valor_total DECIMAL(10,2),
    fornecedor VARCHAR(100),
    prioridade VARCHAR(20) DEFAULT 'media',
    observacoes TEXT,
    numero_pedido VARCHAR(50),
    aprovado_por INTEGER,
    data_aprovacao TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto) ON DELETE CASCADE,
    FOREIGN KEY (id_plataforma) REFERENCES Plataforma(id_plataforma) ON DELETE CASCADE,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE,
    FOREIGN KEY (id_fornecedor) REFERENCES Fornecedor(id_fornecedor) ON DELETE SET NULL,
    FOREIGN KEY (aprovado_por) REFERENCES Usuario(id_usuario) ON DELETE SET NULL
);

-- ===== TABELAS ADICIONAIS =====

-- Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS Fornecedor (
    id_fornecedor SERIAL PRIMARY KEY,
    id_empresa INTEGER NOT NULL,
    nome VARCHAR(200) NOT NULL,
    cnpj VARCHAR(18),
    email VARCHAR(100),
    telefone VARCHAR(20),
    endereco TEXT,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE
);

-- Tabela de Tarefas (Sistema Kanban)
CREATE TABLE IF NOT EXISTS Tarefa (
    id_tarefa SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    status VARCHAR(20) DEFAULT 'a_fazer',
    prioridade VARCHAR(20) DEFAULT 'media',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_conclusao TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);

-- Tabela de Sugestões de Compra
CREATE TABLE IF NOT EXISTS SugestaoCompra (
    id_sugestao SERIAL PRIMARY KEY,
    id_produto INTEGER NOT NULL,
    quantidade_sugerida INTEGER NOT NULL,
    motivo TEXT,
    prioridade VARCHAR(20) DEFAULT 'media',
    status VARCHAR(20) DEFAULT 'pendente',
    data_sugestao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processado_em TIMESTAMP,
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto) ON DELETE CASCADE
);

-- Tabela de Emails
CREATE TABLE IF NOT EXISTS Email (
    id_email SERIAL PRIMARY KEY,
    id_empresa INTEGER NOT NULL,
    id_remetente INTEGER,
    id_destinatario INTEGER,
    email_destinatario VARCHAR(100),
    assunto VARCHAR(200) NOT NULL,
    corpo TEXT NOT NULL,
    prioridade VARCHAR(20) DEFAULT 'normal',
    categoria VARCHAR(50) DEFAULT 'geral',
    status VARCHAR(20) DEFAULT 'enviado',
    lido BOOLEAN DEFAULT false,
    data_leitura TIMESTAMP,
    anexos TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE,
    FOREIGN KEY (id_remetente) REFERENCES Usuario(id_usuario) ON DELETE SET NULL,
    FOREIGN KEY (id_destinatario) REFERENCES Usuario(id_usuario) ON DELETE SET NULL
);

-- Tabela de Movimentação de Estoque
CREATE TABLE IF NOT EXISTS MovimentacaoEstoque (
    id_movimentacao SERIAL PRIMARY KEY,
    id_produto INTEGER NOT NULL,
    id_empresa INTEGER NOT NULL,
    tipo_movimentacao VARCHAR(20) NOT NULL, -- 'entrada', 'saida', 'transferencia', 'full'
    quantidade INTEGER NOT NULL,
    quantidade_anterior INTEGER NOT NULL,
    quantidade_atual INTEGER NOT NULL,
    motivo VARCHAR(100),
    observacoes TEXT,
    id_usuario INTEGER,
    id_venda INTEGER,
    id_pedido INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto) ON DELETE CASCADE,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE SET NULL,
    FOREIGN KEY (id_venda) REFERENCES Venda(id_venda) ON DELETE SET NULL,
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido) ON DELETE SET NULL
);

-- ===== INSERÇÃO DE DADOS INICIAIS =====

-- Empresa Principal
INSERT INTO Empresa (nome_fantasia, cnpj) VALUES
('PCR Labor', '12.345.678/0001-90')
ON CONFLICT (cnpj) DO NOTHING;

-- Plataformas de E-commerce
INSERT INTO Plataforma (nome) VALUES
('Mercado Livre'),
('Shopee'),
('Site Próprio')
ON CONFLICT (nome) DO NOTHING;

-- Usuário Administrador (senha: admin123)
INSERT INTO Usuario (nome, email, senha_hash, id_empresa) VALUES
('Administrador', 'admin@pcrlabor.com', '$2b$10$ItyVPLcKUT4MqafanoZuLehYUZHOAtRw.eVOF.V8LlORbXkOJaN2K', 1)
ON CONFLICT (email) DO NOTHING;

-- Produtos PCR de Exemplo
INSERT INTO Produto (id_empresa, nome, sku, preco, preco_base, custo_frete, estoque_atual, estoque_minimo, categoria, descricao) VALUES
(1, 'Kit PCR COVID-19', 'PCR-COVID-001', 89.90, 65.00, 8.50, 150, 20, 'Diagnóstico', 'Kit para detecção de COVID-19 por PCR'),
(1, 'Kit PCR Influenza', 'PCR-FLU-001', 79.90, 58.00, 7.80, 200, 25, 'Diagnóstico', 'Kit para detecção de Influenza A/B por PCR'),
(1, 'Kit PCR Hepatite B', 'PCR-HEP-001', 95.50, 72.00, 9.20, 100, 15, 'Diagnóstico', 'Kit para detecção de Hepatite B por PCR'),
(1, 'Kit PCR Dengue', 'PCR-DEN-001', 85.00, 62.50, 8.00, 120, 20, 'Diagnóstico', 'Kit para detecção de Dengue por PCR'),
(1, 'Kit PCR Zika', 'PCR-ZIKA-001', 92.00, 68.00, 8.80, 80, 15, 'Diagnóstico', 'Kit para detecção de Zika vírus por PCR')
ON CONFLICT (sku) DO NOTHING;

-- Fornecedores de Exemplo
INSERT INTO Fornecedor (id_empresa, nome, cnpj, email, telefone, endereco) VALUES
(1, 'BioTech Suprimentos Ltda', '12.345.678/0001-90', 'contato@biotech.com', '(11) 99999-9999', 'São Paulo, SP'),
(1, 'MedLab Equipamentos S.A.', '98.765.432/0001-10', 'vendas@medlab.com', '(11) 88888-8888', 'Rio de Janeiro, RJ'),
(1, 'LabCorp Distribuidora', '11.222.333/0001-44', 'comercial@labcorp.com.br', '(21) 77777-7777', 'Belo Horizonte, MG'),
(1, 'Diagnósticos Unidos', '55.666.777/0001-88', 'suporte@diagunidos.com', '(11) 66666-6666', 'Campinas, SP')
ON CONFLICT DO NOTHING;

-- Vendas de Exemplo
INSERT INTO Venda (id_produto, id_plataforma, quantidade, data, valor_total) VALUES
(1, 1, 10, '2025-01-01', 899.00),
(1, 2, 5, '2025-01-02', 449.50),
(2, 1, 8, '2025-01-03', 639.20),
(3, 3, 3, '2025-01-04', 286.50),
(4, 1, 6, '2025-01-05', 510.00),
(5, 2, 4, '2025-01-06', 368.00)
ON CONFLICT DO NOTHING;

-- Pedidos de Exemplo com Datas Variadas
INSERT INTO Pedido (id_produto, id_plataforma, quantidade, status, data_pedido, valor_total, fornecedor, prioridade) VALUES
-- Pedidos de hoje
(1, 1, 50, 'PENDENTE', CURRENT_DATE, 4495.00, 'BioTech LTDA', 'alta'),
(2, 2, 30, 'APROVADO', CURRENT_DATE, 2397.00, 'MedLab Supply', 'media'),
-- Pedidos dos últimos 7 dias
(3, 1, 25, 'PENDENTE', CURRENT_DATE - INTERVAL '1 day', 2387.50, 'Diagnósticos S.A.', 'media'),
(1, 3, 40, 'APROVADO', CURRENT_DATE - INTERVAL '2 days', 3596.00, 'PCR Labor', 'baixa'),
(2, 2, 20, 'CANCELADO', CURRENT_DATE - INTERVAL '3 days', 1598.00, 'BioTech LTDA', 'media'),
-- Pedidos deste mês
(3, 1, 60, 'APROVADO', CURRENT_DATE - INTERVAL '10 days', 4794.00, 'PCR Labor', 'alta'),
(1, 2, 45, 'PENDENTE', CURRENT_DATE - INTERVAL '15 days', 4297.50, 'BioTech LTDA', 'urgente'),
-- Pedidos de meses anteriores
(2, 3, 80, 'APROVADO', CURRENT_DATE - INTERVAL '35 days', 7640.00, 'PCR Labor', 'media'),
(3, 1, 55, 'CANCELADO', CURRENT_DATE - INTERVAL '45 days', 4944.50, 'MedLab Supply', 'baixa')
ON CONFLICT DO NOTHING;

-- Sugestões de Compra
INSERT INTO SugestaoCompra (id_produto, quantidade_sugerida, status, prioridade) VALUES
(1, 50, 'pendente', 'alta'),
(2, 75, 'pendente', 'media'),
(3, 30, 'aprovada', 'baixa')
ON CONFLICT DO NOTHING;

-- ===== CORREÇÕES ADICIONAIS =====

-- Adicionar campo id_empresa na tabela Tarefa para isolamento entre empresas
ALTER TABLE Tarefa ADD COLUMN IF NOT EXISTS id_empresa INTEGER;
ALTER TABLE Tarefa ADD CONSTRAINT IF NOT EXISTS fk_tarefa_empresa
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE;

-- Atualizar tasks existentes para associar à empresa do usuário
UPDATE Tarefa
SET id_empresa = u.id_empresa
FROM Usuario u
WHERE Tarefa.id_usuario = u.id_usuario AND Tarefa.id_empresa IS NULL;

-- Dados de exemplo para Tarefas (com isolamento por empresa)
INSERT INTO Tarefa (id_usuario, id_empresa, titulo, descricao, prioridade, status) VALUES
(1, 1, 'Revisar estoque de kits COVID', 'Verificar níveis de estoque e fazer pedidos se necessário', 'alta', 'a_fazer'),
(1, 1, 'Atualizar preços no Mercado Livre', 'Ajustar preços conforme nova tabela de custos', 'media', 'fazendo'),
(1, 1, 'Preparar relatório mensal', 'Compilar dados de vendas e estoque do mês', 'baixa', 'concluido'),
(1, 1, 'Contatar fornecedor BioTech', 'Negociar melhores condições de pagamento', 'media', 'a_fazer'),
(1, 1, 'Implementar novo sistema de alertas', 'Configurar alertas automáticos para estoque baixo', 'alta', 'fazendo')
ON CONFLICT DO NOTHING;

-- Dados de exemplo para Emails
INSERT INTO Email (id_empresa, assunto, corpo, prioridade, categoria, lido) VALUES
(1, 'Relatório Diário de Vendas', 'Seu relatório diário de vendas está pronto. Vendas hoje: R$ 2.450,00.

Resumo:
• Total de vendas: 15 unidades
• Produto mais vendido: Kit PCR COVID-19
• Plataforma líder: Mercado Livre

Acesse o dashboard para mais detalhes.', 'normal', 'relatorio', false),

(1, 'Alerta: Estoque Baixo', 'Atenção! Os seguintes produtos estão com estoque baixo:

• Kit PCR COVID-19: 5 unidades restantes
• Kit PCR Dengue: 8 unidades restantes

Recomendamos reabastecer o estoque o quanto antes.', 'alta', 'alerta', false),

(1, 'Novo Pedido Recebido - Mercado Livre', 'Você recebeu um novo pedido!

Detalhes:
• Plataforma: Mercado Livre
• Produto: Kit PCR Influenza
• Quantidade: 5 unidades
• Valor: R$ 399,50

Acesse a seção de pedidos para processar.', 'normal', 'pedido', true),

(1, 'Sincronização de Dados Concluída', 'A sincronização automática com as plataformas foi concluída com sucesso.

Resumo:
• Shopee: 3 novos pedidos
• Mercado Livre: 7 novos pedidos
• Atualizações de estoque: 12 produtos

Todos os dados estão atualizados.', 'baixa', 'sistema', true),

(1, 'Promoção Sugerida - Kit PCR Zika', 'Nossa IA detectou uma oportunidade!

O Kit PCR Zika está com baixa rotatividade. Sugerimos:
• Desconto de 15% por tempo limitado
• Foco em marketing no Shopee
• Bundle com outros produtos

Estoque atual: 80 unidades', 'normal', 'sugestao', false)
ON CONFLICT DO NOTHING;

-- Dados de exemplo para Movimentação de Estoque
INSERT INTO MovimentacaoEstoque (id_produto, id_empresa, tipo_movimentacao, quantidade, quantidade_anterior, quantidade_atual, motivo, observacoes) VALUES
(1, 1, 'entrada', 50, 100, 150, 'Reposição de estoque', 'Compra do fornecedor BioTech'),
(1, 1, 'saida', 10, 150, 140, 'Venda realizada', 'Venda no Mercado Livre'),
(2, 1, 'entrada', 75, 125, 200, 'Reposição de estoque', 'Compra do fornecedor MedLab'),
(2, 1, 'saida', 8, 200, 192, 'Venda realizada', 'Venda no Shopee'),
(3, 1, 'full', 20, 100, 80, 'Envio para fulfillment', 'Produtos enviados para centro de distribuição'),
(4, 1, 'entrada', 40, 80, 120, 'Reposição de estoque', 'Compra emergencial'),
(5, 1, 'saida', 4, 80, 76, 'Venda realizada', 'Venda no site próprio')
ON CONFLICT DO NOTHING;

-- ===== FINALIZAÇÃO =====
-- Todas as correções foram aplicadas com sucesso!
