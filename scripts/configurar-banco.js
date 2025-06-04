/**
 * =====================================================
 * PCR LABOR - CONFIGURADOR DO BANCO DE DADOS
 * =====================================================
 * 
 * Script para executar o arquivo SQL consolidado
 * que cria toda a estrutura do banco PCR Labor
 * 
 * Uso: npm run setup-db
 * Arquivo: scripts/configurar-banco.js
 * 
 * =====================================================
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// ===== CONFIGURAÇÃO DO BANCO =====
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'pcr_labor',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

/**
 * Executa o arquivo SQL consolidado
 */
async function executarDatabaseCompleto() {
  console.log('🚀 Iniciando criação do banco PCR Labor...\n');
  
  try {
    // Ler o arquivo SQL consolidado
    const sqlPath = path.join(__dirname, 'database-completo.sql');
    console.log('📄 Lendo arquivo SQL:', sqlPath);
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error('Arquivo database-completo.sql não encontrado!');
    }
    
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log('✅ Arquivo SQL carregado com sucesso');
    console.log(`📊 Tamanho do arquivo: ${(sqlContent.length / 1024).toFixed(2)} KB\n`);
    
    // Conectar ao banco
    console.log('🔌 Conectando ao banco de dados...');
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida com sucesso\n');
    
    // Executar o SQL
    console.log('⚙️ Executando comandos SQL...');
    console.log('⏳ Isso pode levar alguns segundos...\n');
    
    const startTime = Date.now();
    await client.query(sqlContent);
    const endTime = Date.now();
    
    console.log('✅ Comandos SQL executados com sucesso!');
    console.log(`⏱️ Tempo de execução: ${endTime - startTime}ms\n`);
    
    // Verificar estrutura criada
    console.log('🔍 Verificando estrutura criada...');
    
    const tabelas = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const views = await client.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const indices = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      ORDER BY indexname
    `);
    
    console.log('📋 ESTRUTURA CRIADA:');
    console.log(`   📊 Tabelas: ${tabelas.rows.length}`);
    tabelas.rows.forEach(row => {
      console.log(`      - ${row.table_name}`);
    });
    
    console.log(`   👁️ Views: ${views.rows.length}`);
    views.rows.forEach(row => {
      console.log(`      - ${row.table_name}`);
    });
    
    console.log(`   🔍 Índices: ${indices.rows.length}`);
    
    // Verificar dados inseridos
    console.log('\n📊 DADOS INSERIDOS:');
    
    const empresas = await client.query('SELECT COUNT(*) FROM Empresa');
    const usuarios = await client.query('SELECT COUNT(*) FROM Usuario');
    const plataformas = await client.query('SELECT COUNT(*) FROM Plataforma');
    const produtos = await client.query('SELECT COUNT(*) FROM Produto');
    
    console.log(`   🏢 Empresas: ${empresas.rows[0].count}`);
    console.log(`   👤 Usuários: ${usuarios.rows[0].count}`);
    console.log(`   🛒 Plataformas: ${plataformas.rows[0].count}`);
    console.log(`   📦 Produtos: ${produtos.rows[0].count}`);
    
    // Testar views
    console.log('\n🧪 TESTANDO VIEWS:');
    
    try {
      const vendasView = await client.query('SELECT COUNT(*) FROM vw_vendas_completas');
      console.log(`   ✅ vw_vendas_completas: ${vendasView.rows[0].count} registros`);
    } catch (error) {
      console.log(`   ❌ vw_vendas_completas: ${error.message}`);
    }
    
    try {
      const estoqueView = await client.query('SELECT COUNT(*) FROM vw_estoque_status');
      console.log(`   ✅ vw_estoque_status: ${estoqueView.rows[0].count} registros`);
    } catch (error) {
      console.log(`   ❌ vw_estoque_status: ${error.message}`);
    }
    
    // Liberar conexão
    client.release();
    
    console.log('\n🎉 BANCO PCR LABOR CRIADO COM SUCESSO!');
    console.log('🚀 Sistema pronto para uso!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('   1. Execute: npm start');
    console.log('   2. Acesse: http://localhost:3000');
    console.log('   3. Login: admin@pcrlabor.com / admin123');
    
  } catch (error) {
    console.error('❌ ERRO ao criar banco:', error.message);
    console.error('\n🔧 POSSÍVEIS SOLUÇÕES:');
    console.error('   1. Verifique se o PostgreSQL está rodando');
    console.error('   2. Confirme as credenciais no arquivo .env');
    console.error('   3. Verifique se o banco "pcr_labor" existe');
    console.error('   4. Execute: createdb pcr_labor (se necessário)');
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

/**
 * Função para verificar pré-requisitos
 */
async function verificarPreRequisitos() {
  console.log('🔍 Verificando pré-requisitos...\n');
  
  // Verificar arquivo .env
  if (!fs.existsSync('.env')) {
    console.log('⚠️ Arquivo .env não encontrado');
    console.log('📝 Criando arquivo .env com configurações padrão...');
    
    const envContent = `# Configurações do Banco PCR Labor
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pcr_labor
DB_USER=postgres
DB_PASSWORD=password

# Configurações da Aplicação
PORT=3000
NODE_ENV=development
SESSION_SECRET=pcr_labor_secret_key_2025
`;
    
    fs.writeFileSync('.env', envContent);
    console.log('✅ Arquivo .env criado com sucesso\n');
  }
  
  // Testar conexão
  try {
    console.log('🔌 Testando conexão com o banco...');
    const client = await pool.connect();
    console.log('✅ Conexão com PostgreSQL estabelecida');
    client.release();
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    throw error;
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('='.repeat(60));
  console.log('🏥 PCR LABOR - SETUP DO BANCO DE DADOS');
  console.log('='.repeat(60));
  console.log('📅 Data:', new Date().toLocaleString('pt-BR'));
  console.log('🔧 Versão: 1.0 Final');
  console.log('='.repeat(60));
  console.log();
  
  try {
    await verificarPreRequisitos();
    await executarDatabaseCompleto();
  } catch (error) {
    console.error('\n💥 FALHA NA EXECUÇÃO:', error.message);
    process.exit(1);
  }
}

// ===== EXECUÇÃO =====
if (require.main === module) {
  main();
}

// ===== EXPORTAÇÕES =====
module.exports = {
  executarDatabaseCompleto,
  verificarPreRequisitos
};
