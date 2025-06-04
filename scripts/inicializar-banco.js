/**
 * =====================================================
 * PCR LABOR - INICIALIZADOR DO BANCO DE DADOS
 * =====================================================
 * 
 * Script para inicializar o banco usando o arquivo init.sql
 * (Método legado - use npm run setup-db para o método atual)
 * 
 * Uso: npm run init-db
 * Arquivo: scripts/inicializar-banco.js
 * 
 * =====================================================
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// ===== CONFIGURAÇÃO DO BANCO =====
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * Executar script SQL de inicialização
 */
const runSQLScript = async () => {
  console.log('🚀 Iniciando inicialização do banco PCR Labor...\n');
  
  try {
    // Ler arquivo init.sql
    const filePath = path.join(__dirname, 'init.sql');
    console.log('📄 Lendo arquivo:', filePath);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Arquivo init.sql não encontrado!');
    }
    
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log('✅ Arquivo SQL carregado com sucesso');
    console.log(`📊 Tamanho: ${(sql.length / 1024).toFixed(2)} KB\n`);
    
    // Executar SQL
    console.log('⚙️ Executando comandos SQL...');
    const startTime = Date.now();
    
    await pool.query(sql);
    
    const endTime = Date.now();
    console.log('✅ Script SQL executado com sucesso!');
    console.log(`⏱️ Tempo de execução: ${endTime - startTime}ms\n`);
    
    // Verificar resultado
    console.log('🔍 Verificando estrutura criada...');
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`📊 Tabelas criadas: ${result.rows.length}`);
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    console.log('\n🎉 INICIALIZAÇÃO CONCLUÍDA!');
    console.log('🔐 Credenciais de login:');
    console.log('   Email: admin@pcrlabor.com');
    console.log('   Senha: admin123');
    
  } catch (err) {
    console.error('❌ Erro ao executar o script SQL:', err.message);
    console.error('\n🔧 POSSÍVEIS SOLUÇÕES:');
    console.error('   1. Verifique se o PostgreSQL está rodando');
    console.error('   2. Confirme as credenciais no arquivo .env');
    console.error('   3. Use npm run setup-db para o método atual');
    
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// ===== EXECUÇÃO =====
if (require.main === module) {
  console.log('='.repeat(50));
  console.log('🏥 PCR LABOR - INICIALIZAÇÃO LEGADA');
  console.log('='.repeat(50));
  console.log('⚠️ AVISO: Este é o método legado');
  console.log('💡 Recomendado: npm run setup-db');
  console.log('='.repeat(50));
  console.log();
  
  runSQLScript();
}

// ===== EXPORTAÇÕES =====
module.exports = { runSQLScript };
