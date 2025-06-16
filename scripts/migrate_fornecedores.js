const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração do banco
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'pcr_labor',
  password: 'admin',
  port: 5432,
});

async function executeMigration() {
  try {
    console.log('🔄 Iniciando migração de fornecedores...');

    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, '..', 'database', 'migrations', '003_create_fornecedores.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Executar a migração
    await pool.query(sql);

    console.log('✅ Migração de fornecedores executada com sucesso!');

    // Verificar se os dados foram inseridos
    const result = await pool.query('SELECT COUNT(*) as total FROM fornecedores');
    console.log(`📊 Total de fornecedores inseridos: ${result.rows[0].total}`);

    // Mostrar fornecedores por empresa
    const fornecedoresPorEmpresa = await pool.query(`
      SELECT 
        f.id_empresa,
        e.nome as empresa_nome,
        COUNT(f.id_fornecedor) as total_fornecedores
      FROM fornecedores f
      LEFT JOIN empresas e ON f.id_empresa = e.id_empresa
      GROUP BY f.id_empresa, e.nome
      ORDER BY f.id_empresa
    `);

    console.log('\n📋 Fornecedores por empresa:');
    fornecedoresPorEmpresa.rows.forEach(row => {
      console.log(`  • Empresa ${row.id_empresa} (${row.empresa_nome || 'N/A'}): ${row.total_fornecedores} fornecedores`);
    });

    // Mostrar alguns fornecedores de exemplo
    const exemploFornecedores = await pool.query(`
      SELECT 
        f.nome,
        f.contato,
        f.telefone,
        f.categoria,
        f.status,
        e.nome as empresa_nome
      FROM fornecedores f
      LEFT JOIN empresas e ON f.id_empresa = e.id_empresa
      ORDER BY f.id_empresa, f.nome
      LIMIT 5
    `);

    console.log('\n🏭 Exemplos de fornecedores:');
    exemploFornecedores.rows.forEach(row => {
      console.log(`  • ${row.nome} (${row.empresa_nome || 'N/A'}) - ${row.contato} - ${row.telefone} - ${row.categoria} - ${row.status}`);
    });

  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    await pool.end();
  }
}

// Executar migração
executeMigration();
