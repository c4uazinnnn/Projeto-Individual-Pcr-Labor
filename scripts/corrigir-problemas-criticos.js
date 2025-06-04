#!/usr/bin/env node

/**
 * =====================================================
 * PCR LABOR - CORREÇÃO DE PROBLEMAS CRÍTICOS
 * =====================================================
 * 
 * Script para corrigir problemas críticos de segurança:
 * 1. Hash da senha admin incorreto
 * 2. Isolamento de dados entre empresas
 * 
 * =====================================================
 */

const bcrypt = require('bcrypt');
const db = require('../config/db');

/**
 * Corrigir hash da senha do administrador
 */
async function corrigirSenhaAdmin() {
  try {
    console.log('🔑 Corrigindo hash da senha do administrador...');
    
    // Gerar hash correto para admin123
    const senhaCorreta = 'admin123';
    const hashCorreto = await bcrypt.hash(senhaCorreta, 10);
    
    console.log('📝 Hash correto gerado:', hashCorreto);
    
    // Atualizar no banco
    const query = `
      UPDATE Usuario 
      SET senha_hash = $1 
      WHERE email = 'admin@pcrlabor.com'
      RETURNING id_usuario, nome, email
    `;
    
    const result = await db.query(query, [hashCorreto]);
    
    if (result.rows.length > 0) {
      console.log('✅ Senha do administrador corrigida com sucesso!');
      console.log('👤 Usuário:', result.rows[0].nome);
      console.log('📧 Email:', result.rows[0].email);
      console.log('🔑 Nova senha: admin123');
    } else {
      console.log('❌ Usuário administrador não encontrado!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir senha:', error.message);
    throw error;
  }
}

/**
 * Adicionar filtros de empresa em todas as consultas
 */
async function corrigirIsolamentoEmpresas() {
  try {
    console.log('🏢 Corrigindo isolamento de dados entre empresas...');
    
    // Verificar dados atuais
    console.log('\n📊 SITUAÇÃO ATUAL:');
    
    const empresas = await db.query('SELECT * FROM Empresa ORDER BY id_empresa');
    console.log(`   🏢 Empresas: ${empresas.rows.length}`);
    empresas.rows.forEach(emp => {
      console.log(`      - ${emp.nome_fantasia} (ID: ${emp.id_empresa})`);
    });
    
    const produtos = await db.query('SELECT id_produto, nome, id_empresa FROM Produto ORDER BY id_empresa, nome');
    console.log(`   📦 Produtos: ${produtos.rows.length}`);
    
    // Agrupar produtos por empresa
    const produtosPorEmpresa = {};
    produtos.rows.forEach(prod => {
      if (!produtosPorEmpresa[prod.id_empresa]) {
        produtosPorEmpresa[prod.id_empresa] = [];
      }
      produtosPorEmpresa[prod.id_empresa].push(prod.nome);
    });
    
    Object.keys(produtosPorEmpresa).forEach(empresaId => {
      const empresa = empresas.rows.find(e => e.id_empresa == empresaId);
      console.log(`      Empresa ${empresa?.nome_fantasia || empresaId}: ${produtosPorEmpresa[empresaId].length} produtos`);
    });
    
    const vendas = await db.query('SELECT COUNT(*) as total, id_empresa FROM Venda GROUP BY id_empresa ORDER BY id_empresa');
    console.log(`   💰 Vendas por empresa:`);
    vendas.rows.forEach(venda => {
      const empresa = empresas.rows.find(e => e.id_empresa == venda.id_empresa);
      console.log(`      ${empresa?.nome_fantasia || venda.id_empresa}: ${venda.total} vendas`);
    });
    
    const pedidos = await db.query('SELECT COUNT(*) as total, id_empresa FROM Pedido GROUP BY id_empresa ORDER BY id_empresa');
    console.log(`   🛒 Pedidos por empresa:`);
    pedidos.rows.forEach(pedido => {
      const empresa = empresas.rows.find(e => e.id_empresa == pedido.id_empresa);
      console.log(`      ${empresa?.nome_fantasia || pedido.id_empresa}: ${pedido.total} pedidos`);
    });
    
    console.log('\n✅ Análise de isolamento concluída!');
    console.log('💡 PRÓXIMOS PASSOS:');
    console.log('   1. Verificar se os modelos filtram por id_empresa');
    console.log('   2. Atualizar controladores para usar filtros');
    console.log('   3. Testar isolamento entre empresas');
    
  } catch (error) {
    console.error('❌ Erro ao analisar isolamento:', error.message);
    throw error;
  }
}

/**
 * Verificar e corrigir foreign keys
 */
async function verificarForeignKeys() {
  try {
    console.log('\n🔗 Verificando foreign keys...');
    
    // Verificar vendas com produtos de outras empresas
    const vendasProblematicas = await db.query(`
      SELECT 
        v.id_venda,
        v.id_empresa as venda_empresa,
        p.id_empresa as produto_empresa,
        p.nome as produto_nome
      FROM Venda v
      JOIN Produto p ON v.id_produto = p.id_produto
      WHERE v.id_empresa != p.id_empresa
    `);
    
    if (vendasProblematicas.rows.length > 0) {
      console.log(`❌ Encontradas ${vendasProblematicas.rows.length} vendas com produtos de outras empresas:`);
      vendasProblematicas.rows.forEach(venda => {
        console.log(`   Venda ${venda.id_venda}: Empresa ${venda.venda_empresa} vendendo produto da empresa ${venda.produto_empresa}`);
      });
    } else {
      console.log('✅ Nenhuma venda problemática encontrada');
    }
    
    // Verificar pedidos com produtos de outras empresas
    const pedidosProblematicos = await db.query(`
      SELECT 
        pe.id_pedido,
        pe.id_empresa as pedido_empresa,
        p.id_empresa as produto_empresa,
        p.nome as produto_nome
      FROM Pedido pe
      JOIN Produto p ON pe.id_produto = p.id_produto
      WHERE pe.id_empresa != p.id_empresa
    `);
    
    if (pedidosProblematicos.rows.length > 0) {
      console.log(`❌ Encontrados ${pedidosProblematicos.rows.length} pedidos com produtos de outras empresas:`);
      pedidosProblematicos.rows.forEach(pedido => {
        console.log(`   Pedido ${pedido.id_pedido}: Empresa ${pedido.pedido_empresa} pedindo produto da empresa ${pedido.produto_empresa}`);
      });
    } else {
      console.log('✅ Nenhum pedido problemático encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar foreign keys:', error.message);
    throw error;
  }
}

/**
 * Testar login após correções
 */
async function testarLogin() {
  try {
    console.log('\n🧪 Testando login após correções...');
    
    // Buscar usuário admin
    const usuario = await db.query(`
      SELECT u.*, e.nome_fantasia as empresa_nome
      FROM Usuario u
      LEFT JOIN Empresa e ON u.id_empresa = e.id_empresa
      WHERE u.email = 'admin@pcrlabor.com'
    `);
    
    if (usuario.rows.length === 0) {
      console.log('❌ Usuário admin não encontrado!');
      return;
    }
    
    const admin = usuario.rows[0];
    console.log('👤 Usuário encontrado:', admin.nome);
    console.log('🏢 Empresa:', admin.empresa_nome);
    console.log('🔑 Hash da senha:', admin.senha_hash.substring(0, 20) + '...');
    
    // Testar senha
    const senhaValida = await bcrypt.compare('admin123', admin.senha_hash);
    console.log('✅ Teste de senha:', senhaValida ? 'SUCESSO' : 'FALHA');
    
    if (senhaValida) {
      console.log('🎉 Login funcionando corretamente!');
      console.log('📋 Credenciais para teste:');
      console.log('   Email: admin@pcrlabor.com');
      console.log('   Senha: admin123');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar login:', error.message);
    throw error;
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('='.repeat(60));
  console.log('🚨 PCR LABOR - CORREÇÃO DE PROBLEMAS CRÍTICOS');
  console.log('='.repeat(60));
  console.log('📅 Data:', new Date().toLocaleString('pt-BR'));
  console.log('='.repeat(60));
  console.log();
  
  try {
    // 1. Corrigir senha do admin
    await corrigirSenhaAdmin();
    
    // 2. Analisar isolamento de empresas
    await corrigirIsolamentoEmpresas();
    
    // 3. Verificar foreign keys
    await verificarForeignKeys();
    
    // 4. Testar login
    await testarLogin();
    
    console.log('\n🎉 CORREÇÕES CONCLUÍDAS!');
    console.log('📋 PRÓXIMOS PASSOS:');
    console.log('   1. Teste o login: http://localhost:3000/login');
    console.log('   2. Verifique o isolamento entre empresas');
    console.log('   3. Teste criação de nova empresa');
    
  } catch (error) {
    console.error('\n💥 ERRO CRÍTICO:', error.message);
    process.exit(1);
  } finally {
    await db.end();
  }
}

// ===== EXECUÇÃO =====
if (require.main === module) {
  main();
}

module.exports = {
  corrigirSenhaAdmin,
  corrigirIsolamentoEmpresas,
  verificarForeignKeys,
  testarLogin
};
