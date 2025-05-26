#!/usr/bin/env node

/**
 * Script para criar as novas tabelas que faltaram
 */

const db = require('../config/db');

async function criarTabelasNovas() {
  try {
    console.log('🔧 Criando tabelas novas...\n');

    // 1. Adicionar id_empresa na tabela Venda
    console.log('📝 Adicionando id_empresa na tabela Venda...');
    try {
      await db.query('ALTER TABLE Venda ADD COLUMN IF NOT EXISTS id_empresa INTEGER');
      
      // Atualizar vendas existentes com id_empresa baseado no produto
      await db.query(`
        UPDATE Venda SET id_empresa = (
          SELECT p.id_empresa 
          FROM Produto p 
          WHERE p.id_produto = Venda.id_produto
        ) WHERE id_empresa IS NULL
      `);
      
      console.log('✅ id_empresa adicionado à tabela Venda');
    } catch (error) {
      console.log('❌ Erro:', error.message);
    }

    // 2. Criar tabela Fornecedor
    console.log('\n📝 Criando tabela Fornecedor...');
    try {
      await db.query(`
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
        )
      `);
      console.log('✅ Tabela Fornecedor criada');
    } catch (error) {
      console.log('❌ Erro:', error.message);
    }

    // 3. Criar tabela ProdutoFornecedor
    console.log('\n📝 Criando tabela ProdutoFornecedor...');
    try {
      await db.query(`
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
          FOREIGN KEY (id_fornecedor) REFERENCES Fornecedor(id_fornecedor) ON DELETE CASCADE
        )
      `);
      console.log('✅ Tabela ProdutoFornecedor criada');
    } catch (error) {
      console.log('❌ Erro:', error.message);
    }

    // 4. Criar tabela PedidoCompra
    console.log('\n📝 Criando tabela PedidoCompra...');
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS PedidoCompra (
          id_pedido SERIAL PRIMARY KEY,
          id_empresa INTEGER NOT NULL,
          id_fornecedor INTEGER NOT NULL,
          numero_pedido VARCHAR(50) UNIQUE NOT NULL,
          data_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
          data_entrega_prevista DATE,
          data_entrega_real DATE,
          valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
          status VARCHAR(20) DEFAULT 'pendente',
          observacoes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE,
          FOREIGN KEY (id_fornecedor) REFERENCES Fornecedor(id_fornecedor) ON DELETE CASCADE
        )
      `);
      console.log('✅ Tabela PedidoCompra criada');
    } catch (error) {
      console.log('❌ Erro:', error.message);
    }

    // 5. Criar tabela ItemPedidoCompra
    console.log('\n📝 Criando tabela ItemPedidoCompra...');
    try {
      await db.query(`
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
        )
      `);
      console.log('✅ Tabela ItemPedidoCompra criada');
    } catch (error) {
      console.log('❌ Erro:', error.message);
    }

    // 6. Criar tabela MovimentacaoEstoque
    console.log('\n📝 Criando tabela MovimentacaoEstoque...');
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS MovimentacaoEstoque (
          id_movimentacao SERIAL PRIMARY KEY,
          id_produto INTEGER NOT NULL,
          tipo VARCHAR(20) NOT NULL,
          quantidade INTEGER NOT NULL,
          quantidade_anterior INTEGER NOT NULL,
          quantidade_atual INTEGER NOT NULL,
          motivo VARCHAR(100),
          id_referencia INTEGER,
          tipo_referencia VARCHAR(20),
          id_usuario INTEGER,
          data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (id_produto) REFERENCES Produto(id_produto) ON DELETE CASCADE,
          FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE SET NULL
        )
      `);
      console.log('✅ Tabela MovimentacaoEstoque criada');
    } catch (error) {
      console.log('❌ Erro:', error.message);
    }

    // 7. Criar tabela ConfiguracaoEmpresa
    console.log('\n📝 Criando tabela ConfiguracaoEmpresa...');
    try {
      await db.query(`
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
        )
      `);
      console.log('✅ Tabela ConfiguracaoEmpresa criada');
    } catch (error) {
      console.log('❌ Erro:', error.message);
    }

    // 8. Inserir dados de exemplo
    console.log('\n📝 Inserindo dados de exemplo...');
    try {
      // Fornecedores
      await db.query(`
        INSERT INTO Fornecedor (id_empresa, nome, cnpj, telefone, email, contato_principal) VALUES
        (1, 'BioTech Suprimentos LTDA', '98.765.432/0001-10', '(11) 3333-4444', 'vendas@biotech.com', 'Carlos Silva'),
        (1, 'MedLab Distribuidora', '87.654.321/0001-20', '(11) 5555-6666', 'comercial@medlab.com', 'Ana Santos')
        ON CONFLICT DO NOTHING
      `);

      // Configurações
      await db.query(`
        INSERT INTO ConfiguracaoEmpresa (id_empresa, chave, valor, descricao) VALUES
        (1, 'estoque_minimo_global', '10', 'Estoque mínimo padrão para novos produtos'),
        (1, 'margem_lucro_padrao', '30.00', 'Margem de lucro padrão em %'),
        (1, 'email_alertas', 'admin@pcrlabor.com', 'Email para receber alertas do sistema')
        ON CONFLICT (id_empresa, chave) DO NOTHING
      `);

      console.log('✅ Dados de exemplo inseridos');
    } catch (error) {
      console.log('❌ Erro:', error.message);
    }

    // 9. Criar índices
    console.log('\n📝 Criando índices...');
    try {
      await db.query('CREATE INDEX IF NOT EXISTS idx_venda_empresa ON Venda(id_empresa)');
      await db.query('CREATE INDEX IF NOT EXISTS idx_movimentacao_produto ON MovimentacaoEstoque(id_produto)');
      await db.query('CREATE INDEX IF NOT EXISTS idx_fornecedor_empresa ON Fornecedor(id_empresa)');
      await db.query('CREATE INDEX IF NOT EXISTS idx_pedido_empresa ON PedidoCompra(id_empresa)');
      console.log('✅ Índices criados');
    } catch (error) {
      console.log('❌ Erro:', error.message);
    }

    // 10. Verificar estrutura final
    console.log('\n🔍 Verificando estrutura final...');
    const tabelas = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('\n📋 Tabelas no banco:');
    tabelas.rows.forEach(row => {
      console.log(`  ✅ ${row.table_name}`);
    });

    console.log('\n🎉 Banco de dados melhorado com sucesso!');

  } catch (error) {
    console.error('💥 Erro geral:', error.message);
  } finally {
    await db.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  criarTabelasNovas();
}

module.exports = { criarTabelasNovas };
