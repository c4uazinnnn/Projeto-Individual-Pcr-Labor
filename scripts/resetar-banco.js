/**
 * =====================================================
 * PCR LABOR - RESETADOR DO BANCO DE DADOS
 * =====================================================
 * 
 * Script para resetar completamente o banco de dados
 * ATENÇÃO: Este script irá APAGAR todos os dados!
 * 
 * Uso: npm run reset-db
 * Arquivo: scripts/resetar-banco.js
 * 
 * =====================================================
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/db');

/**
 * Resetar banco de dados completamente
 */
async function resetDatabase() {
  try {
    console.log('🔄 Iniciando reset do banco de dados...');
    console.log('⚠️ ATENÇÃO: Todos os dados serão APAGADOS!\n');
    
    // Ler o arquivo SQL de reset
    const sqlPath = path.join(__dirname, 'reset-db.sql');
    console.log('📄 Lendo arquivo:', sqlPath);
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error('Arquivo reset-db.sql não encontrado!');
    }
    
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    console.log('✅ Arquivo SQL carregado com sucesso');
    console.log(`📊 Tamanho: ${(sqlScript.length / 1024).toFixed(2)} KB\n`);
    
    // Executar o script SQL
    console.log('⚙️ Executando reset...');
    console.log('⏳ Isso pode levar alguns segundos...\n');
    
    const startTime = Date.now();
    await db.query(sqlScript);
    const endTime = Date.now();
    
    console.log('✅ Banco de dados resetado com sucesso!');
    console.log(`⏱️ Tempo de execução: ${endTime - startTime}ms\n`);
    
    // Verificar estrutura recriada
    console.log('🔍 Verificando estrutura recriada...');
    const tabelas = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`📊 Tabelas recriadas: ${tabelas.rows.length}`);
    tabelas.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Verificar dados inseridos
    console.log('\n📊 Verificando dados inseridos...');
    const empresas = await db.query('SELECT COUNT(*) FROM Empresa');
    const usuarios = await db.query('SELECT COUNT(*) FROM Usuario');
    const plataformas = await db.query('SELECT COUNT(*) FROM Plataforma');
    const produtos = await db.query('SELECT COUNT(*) FROM Produto');
    
    console.log(`   🏢 Empresas: ${empresas.rows[0].count}`);
    console.log(`   👤 Usuários: ${usuarios.rows[0].count}`);
    console.log(`   🛒 Plataformas: ${plataformas.rows[0].count}`);
    console.log(`   📦 Produtos: ${produtos.rows[0].count}`);
    
    console.log('\n🎉 RESET CONCLUÍDO COM SUCESSO!');
    console.log('📊 Dados de demonstração inseridos.');
    console.log('\n🔐 Credenciais de login:');
    console.log('   Email: admin@pcrlabor.com');
    console.log('   Senha: admin123');
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('   1. Execute: npm start');
    console.log('   2. Acesse: http://localhost:3000');
    console.log('   3. Faça login com as credenciais acima');
    
  } catch (error) {
    console.error('❌ Erro ao resetar banco de dados:', error.message);
    console.error('\n🔧 POSSÍVEIS SOLUÇÕES:');
    console.error('   1. Verifique se o PostgreSQL está rodando');
    console.error('   2. Confirme as credenciais no arquivo .env');
    console.error('   3. Verifique se o banco existe');
    console.error('   4. Use npm run setup-db como alternativa');
    
    process.exit(1);
  } finally {
    // Fechar conexão
    await db.end();
    process.exit(0);
  }
}

/**
 * Função principal com confirmação
 */
async function main() {
  console.log('='.repeat(60));
  console.log('🏥 PCR LABOR - RESET DO BANCO DE DADOS');
  console.log('='.repeat(60));
  console.log('⚠️ ATENÇÃO: OPERAÇÃO DESTRUTIVA!');
  console.log('📅 Data:', new Date().toLocaleString('pt-BR'));
  console.log('='.repeat(60));
  console.log();
  
  // Aviso de segurança
  console.log('🚨 AVISO IMPORTANTE:');
  console.log('   Este script irá APAGAR TODOS os dados do banco!');
  console.log('   Use apenas em ambiente de desenvolvimento.');
  console.log('   Para produção, faça backup antes de executar.\n');
  
  try {
    await resetDatabase();
  } catch (error) {
    console.error('\n💥 FALHA NO RESET:', error.message);
    process.exit(1);
  }
}

// ===== EXECUÇÃO =====
if (require.main === module) {
  main();
}

// ===== EXPORTAÇÕES =====
module.exports = { resetDatabase };
