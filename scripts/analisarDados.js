#!/usr/bin/env node

/**
 * Script para analisar os dados por empresa no banco
 */

const db = require('../config/db');

async function analisarDados() {
  try {
    console.log('🔍 Analisando dados por empresa...\n');

    // 1. Verificar empresas
    console.log('🏢 EMPRESAS:');
    console.log('=' .repeat(50));
    const empresas = await db.query('SELECT * FROM Empresa ORDER BY id_empresa');
    empresas.rows.forEach(emp => {
      console.log(`ID: ${emp.id_empresa} | Nome: ${emp.nome_fantasia} | CNPJ: ${emp.cnpj}`);
    });

    // 2. Verificar usuários por empresa
    console.log('\n👥 USUÁRIOS POR EMPRESA:');
    console.log('=' .repeat(50));
    const usuarios = await db.query(`
      SELECT u.*, e.nome_fantasia 
      FROM Usuario u 
      LEFT JOIN Empresa e ON u.id_empresa = e.id_empresa 
      ORDER BY u.id_empresa, u.id_usuario
    `);
    
    let empresaAtual = null;
    usuarios.rows.forEach(user => {
      if (user.id_empresa !== empresaAtual) {
        console.log(`\n🏢 ${user.nome_fantasia} (ID: ${user.id_empresa}):`);
        empresaAtual = user.id_empresa;
      }
      console.log(`  👤 ${user.nome} (${user.email})`);
    });

    // 3. Verificar produtos por empresa
    console.log('\n\n📦 PRODUTOS POR EMPRESA:');
    console.log('=' .repeat(50));
    const produtos = await db.query(`
      SELECT p.*, e.nome_fantasia 
      FROM Produto p 
      LEFT JOIN Empresa e ON p.id_empresa = e.id_empresa 
      ORDER BY p.id_empresa, p.id_produto
    `);
    
    empresaAtual = null;
    produtos.rows.forEach(prod => {
      if (prod.id_empresa !== empresaAtual) {
        console.log(`\n🏢 ${prod.nome_fantasia} (ID: ${prod.id_empresa}):`);
        empresaAtual = prod.id_empresa;
      }
      console.log(`  📦 ${prod.nome} (SKU: ${prod.sku}) - Estoque: ${prod.estoque_atual}`);
    });

    // 4. Verificar vendas por empresa
    console.log('\n\n💰 VENDAS POR EMPRESA:');
    console.log('=' .repeat(50));
    const vendas = await db.query(`
      SELECT v.*, p.nome as produto_nome, e.nome_fantasia 
      FROM Venda v 
      LEFT JOIN Produto p ON v.id_produto = p.id_produto
      LEFT JOIN Empresa e ON v.id_empresa = e.id_empresa 
      ORDER BY v.id_empresa, v.id_venda
    `);
    
    empresaAtual = null;
    vendas.rows.forEach(venda => {
      if (venda.id_empresa !== empresaAtual) {
        console.log(`\n🏢 ${venda.nome_fantasia} (ID: ${venda.id_empresa}):`);
        empresaAtual = venda.id_empresa;
      }
      console.log(`  💰 ${venda.produto_nome} - Qtd: ${venda.quantidade} - Valor: R$ ${venda.valor_total}`);
    });

    // 5. Resumo por empresa
    console.log('\n\n📊 RESUMO POR EMPRESA:');
    console.log('=' .repeat(50));
    
    for (const empresa of empresas.rows) {
      const countUsuarios = usuarios.rows.filter(u => u.id_empresa === empresa.id_empresa).length;
      const countProdutos = produtos.rows.filter(p => p.id_empresa === empresa.id_empresa).length;
      const countVendas = vendas.rows.filter(v => v.id_empresa === empresa.id_empresa).length;
      
      console.log(`\n🏢 ${empresa.nome_fantasia} (ID: ${empresa.id_empresa})`);
      console.log(`   👥 Usuários: ${countUsuarios}`);
      console.log(`   📦 Produtos: ${countProdutos}`);
      console.log(`   💰 Vendas: ${countVendas}`);
    }

    // 6. Verificar vendas sem id_empresa
    console.log('\n\n⚠️ VERIFICANDO PROBLEMAS:');
    console.log('=' .repeat(50));
    
    const vendasSemEmpresa = await db.query('SELECT COUNT(*) as count FROM Venda WHERE id_empresa IS NULL');
    console.log(`❌ Vendas sem id_empresa: ${vendasSemEmpresa.rows[0].count}`);
    
    const produtosSemEmpresa = await db.query('SELECT COUNT(*) as count FROM Produto WHERE id_empresa IS NULL');
    console.log(`❌ Produtos sem id_empresa: ${produtosSemEmpresa.rows[0].count}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await db.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  analisarDados();
}

module.exports = { analisarDados };
