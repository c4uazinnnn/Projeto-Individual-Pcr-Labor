#!/usr/bin/env node

/**
 * Script para criar novos usuários e produtos no sistema PCR Labor
 *
 * Uso:
 * node scripts/criarUsuarioProdutos.js
 *
 * Ou com parâmetros:
 * node scripts/criarUsuarioProdutos.js --nome "João Silva" --email "joao@exemplo.com"
 */

const bcrypt = require('bcrypt');
const db = require('../config/db');

// Configurações padrão
const CONFIG = {
  saltRounds: 10,
  senhasPadrao: 'usuario123',
  empresaPadrao: 1 // PCR Labor
};

/**
 * Criar nova empresa
 */
async function criarEmpresa(dados) {
  try {
    const { nome_fantasia, cnpj } = dados;

    const query = `
      INSERT INTO Empresa (nome_fantasia, cnpj)
      VALUES ($1, $2)
      RETURNING *
    `;

    const result = await db.query(query, [nome_fantasia, cnpj]);
    console.log('✅ Empresa criada:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Erro ao criar empresa:', error.message);
    throw error;
  }
}

/**
 * Criar novo usuário
 */
async function criarUsuario(dados) {
  try {
    const {
      nome,
      email,
      senha = CONFIG.senhasPadrao,
      id_empresa = CONFIG.empresaPadrao
    } = dados;

    // Gerar hash da senha
    const senha_hash = await bcrypt.hash(senha, CONFIG.saltRounds);

    const query = `
      INSERT INTO Usuario (nome, email, senha_hash, id_empresa)
      VALUES ($1, $2, $3, $4)
      RETURNING id_usuario, nome, email, id_empresa, created_at
    `;

    const result = await db.query(query, [nome, email, senha_hash, id_empresa]);
    console.log('✅ Usuário criado:', result.rows[0]);
    console.log(`🔑 Senha: ${senha}`);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
    throw error;
  }
}

/**
 * Criar produto
 */
async function criarProduto(dados) {
  try {
    const { id_empresa, nome, sku, preco, estoque_atual } = dados;

    const query = `
      INSERT INTO Produto (id_empresa, nome, sku, preco, estoque_atual)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await db.query(query, [id_empresa, nome, sku, preco, estoque_atual]);
    console.log('✅ Produto criado:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Erro ao criar produto:', error.message);
    throw error;
  }
}

/**
 * Criar vendas de exemplo
 */
async function criarVendasExemplo(id_produto) {
  try {
    const vendas = [
      {
        quantidade: 5,
        valor_total: 149.50,
        id_plataforma: 1, // Mercado Livre
        data: '2024-01-15'
      },
      {
        quantidade: 3,
        valor_total: 89.70,
        id_plataforma: 2, // Shopee
        data: '2024-01-16'
      },
      {
        quantidade: 2,
        valor_total: 59.80,
        id_plataforma: 3, // Site Próprio
        data: '2024-01-17'
      }
    ];

    for (const venda of vendas) {
      const query = `
        INSERT INTO Venda (id_produto, id_plataforma, quantidade, valor_total, data)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const result = await db.query(query, [
        id_produto,
        venda.id_plataforma,
        venda.quantidade,
        venda.valor_total,
        venda.data
      ]);

      console.log('✅ Venda criada:', result.rows[0]);
    }
  } catch (error) {
    console.error('❌ Erro ao criar vendas:', error.message);
    throw error;
  }
}

/**
 * Exemplo completo: criar usuário com produtos
 */
async function exemploCompleto() {
  try {
    console.log('🚀 Iniciando criação de usuário e produtos...\n');

    // 1. Criar empresa (opcional)
    const timestamp = Date.now().toString().slice(-4);
    const empresa = await criarEmpresa({
      nome_fantasia: `Exemplo Comércio ${timestamp} LTDA`,
      cnpj: `98.765.432/000${timestamp.slice(-1)}-10`
    });

    // 2. Criar usuário
    const usuario = await criarUsuario({
      nome: 'Maria Exemplo',
      email: `maria${timestamp}@exemplo.com`,
      senha: 'maria123',
      id_empresa: empresa.id_empresa
    });

    // 3. Criar produtos
    const produtos = [
      {
        id_empresa: empresa.id_empresa,
        nome: 'Camiseta Básica',
        sku: `CAM-${timestamp}`,
        preco: 25.90,
        estoque_atual: 100
      },
      {
        id_empresa: empresa.id_empresa,
        nome: 'Calça Jeans',
        sku: `CAL-${timestamp}`,
        preco: 89.90,
        estoque_atual: 50
      },
      {
        id_empresa: empresa.id_empresa,
        nome: 'Tênis Esportivo',
        sku: `TEN-${timestamp}`,
        preco: 159.90,
        estoque_atual: 25
      }
    ];

    const produtosCriados = [];
    for (const produtoData of produtos) {
      const produto = await criarProduto(produtoData);
      produtosCriados.push(produto);
    }

    // 4. Criar vendas de exemplo para o primeiro produto
    console.log('\n📊 Criando vendas de exemplo...');
    await criarVendasExemplo(produtosCriados[0].id_produto);

    console.log('\n🎉 Processo concluído com sucesso!');
    console.log('\n📋 Resumo:');
    console.log(`👤 Usuário: ${usuario.nome} (${usuario.email})`);
    console.log(`🏢 Empresa: ${empresa.nome_fantasia}`);
    console.log(`📦 Produtos: ${produtos.length} criados`);
    console.log(`💰 Vendas: 3 vendas de exemplo criadas`);

    console.log('\n🔐 Para fazer login:');
    console.log(`Email: ${usuario.email}`);
    console.log(`Senha: maria123`);

  } catch (error) {
    console.error('💥 Erro no processo:', error.message);
  } finally {
    await db.end();
  }
}

/**
 * Criar usuário personalizado via argumentos
 */
async function criarUsuarioPersonalizado() {
  const args = process.argv.slice(2);
  const params = {};

  // Processar argumentos
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    params[key] = value;
  }

  if (!params.nome || !params.email) {
    console.log('❌ Parâmetros obrigatórios: --nome e --email');
    console.log('Exemplo: node scripts/criarUsuarioProdutos.js --nome "João Silva" --email "joao@exemplo.com"');
    return;
  }

  try {
    const usuario = await criarUsuario({
      nome: params.nome,
      email: params.email,
      senha: params.senha || CONFIG.senhasPadrao,
      id_empresa: parseInt(params.empresa) || CONFIG.empresaPadrao
    });

    console.log('\n🎉 Usuário criado com sucesso!');
    console.log(`🔐 Email: ${usuario.email}`);
    console.log(`🔑 Senha: ${params.senha || CONFIG.senhasPadrao}`);

  } catch (error) {
    console.error('💥 Erro:', error.message);
  } finally {
    await db.end();
  }
}

// Executar script
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    // Modo personalizado com argumentos
    criarUsuarioPersonalizado();
  } else {
    // Modo exemplo completo
    exemploCompleto();
  }
}

module.exports = {
  criarEmpresa,
  criarUsuario,
  criarProduto,
  criarVendasExemplo
};
