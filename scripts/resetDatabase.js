// scripts/resetDatabase.js

const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function resetDatabase() {
  try {
    console.log('🔄 Iniciando reset do banco de dados...');
    
    // Ler o arquivo SQL de reset
    const sqlPath = path.join(__dirname, 'reset-db.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    
    // Executar o script SQL
    await db.query(sqlScript);
    
    console.log('✅ Banco de dados resetado com sucesso!');
    console.log('📊 Dados de demonstração inseridos.');
    console.log('🔐 Credenciais de login:');
    console.log('   Email: admin@pcrlabor.com');
    console.log('   Senha: admin123');
    
  } catch (error) {
    console.error('❌ Erro ao resetar banco de dados:', error.message);
    process.exit(1);
  } finally {
    // Fechar conexão
    await db.end();
    process.exit(0);
  }
}

// Executar o reset
resetDatabase();
