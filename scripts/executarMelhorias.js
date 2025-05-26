#!/usr/bin/env node

/**
 * Script para executar melhorias no banco de dados
 */

const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function executarMelhorias() {
  try {
    console.log('🔧 Iniciando melhorias no banco de dados...\n');

    // Ler o arquivo SQL
    const sqlPath = path.join(__dirname, 'melhorar_banco.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Dividir em comandos individuais (separados por ponto e vírgula)
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📋 Encontrados ${commands.length} comandos SQL para executar\n`);

    let sucessos = 0;
    let erros = 0;

    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      try {
        // Pular comentários e comandos vazios
        if (command.startsWith('--') || command.trim().length === 0) {
          continue;
        }

        console.log(`⚡ Executando comando ${i + 1}/${commands.length}...`);
        
        // Mostrar apenas os primeiros 100 caracteres do comando
        const preview = command.substring(0, 100).replace(/\s+/g, ' ');
        console.log(`   ${preview}${command.length > 100 ? '...' : ''}`);

        await db.query(command);
        console.log(`✅ Sucesso\n`);
        sucessos++;

      } catch (error) {
        console.log(`❌ Erro: ${error.message}\n`);
        erros++;
        
        // Continuar mesmo com erros (algumas alterações podem já existir)
      }
    }

    console.log('📊 RESUMO DAS MELHORIAS:');
    console.log(`✅ Sucessos: ${sucessos}`);
    console.log(`❌ Erros: ${erros}`);
    console.log(`📋 Total: ${commands.length}`);

    if (erros === 0) {
      console.log('\n🎉 Todas as melhorias foram aplicadas com sucesso!');
    } else {
      console.log('\n⚠️ Algumas melhorias falharam, mas isso pode ser normal (campos já existentes, etc.)');
    }

    // Verificar estrutura final
    console.log('\n🔍 Verificando estrutura final do banco...');
    await verificarEstrutura();

  } catch (error) {
    console.error('💥 Erro geral:', error.message);
  } finally {
    await db.end();
  }
}

async function verificarEstrutura() {
  try {
    // Verificar tabelas criadas
    const tabelas = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('\n📋 Tabelas no banco:');
    tabelas.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Verificar colunas da tabela Produto (exemplo)
    const colunasProduto = await db.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'produto' 
      ORDER BY ordinal_position
    `);

    console.log('\n📦 Colunas da tabela Produto:');
    colunasProduto.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Verificar colunas da tabela Usuario
    const colunasUsuario = await db.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'usuario' 
      ORDER BY ordinal_position
    `);

    console.log('\n👤 Colunas da tabela Usuario:');
    colunasUsuario.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Contar registros por empresa
    const empresas = await db.query(`
      SELECT 
        e.nome_fantasia,
        COUNT(u.id_usuario) as usuarios,
        COUNT(p.id_produto) as produtos
      FROM Empresa e
      LEFT JOIN Usuario u ON e.id_empresa = u.id_empresa
      LEFT JOIN Produto p ON e.id_empresa = p.id_empresa
      GROUP BY e.id_empresa, e.nome_fantasia
      ORDER BY e.id_empresa
    `);

    console.log('\n🏢 Dados por empresa:');
    empresas.rows.forEach(row => {
      console.log(`  - ${row.nome_fantasia}: ${row.usuarios} usuários, ${row.produtos} produtos`);
    });

  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  executarMelhorias();
}

module.exports = { executarMelhorias };
