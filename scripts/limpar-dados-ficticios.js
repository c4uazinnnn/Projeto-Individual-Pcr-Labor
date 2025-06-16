const db = require('../config/db');

async function limparDadosFicticios() {
  console.log('🧹 Iniciando limpeza de dados fictícios...\n');

  try {

    console.log('1. 🗑️ Limpando pedidos fictícios...');
    await db.query(`
      DELETE FROM Pedido
      WHERE fornecedor IN ('BioTech LTDA', 'MedLab Supply', 'Diagnósticos S.A.', 'PCR Labor')
    `);

    console.log('2. 🗑️ Limpando vendas fictícias...');
    await db.query(`
      DELETE FROM Venda
      WHERE id_produto IN (
        SELECT id_produto FROM Produto WHERE sku LIKE 'PCR-%'
      )
    `);

    console.log('3. 🗑️ Limpando produtos fictícios...');
    await db.query(`
      DELETE FROM Produto
      WHERE sku LIKE 'PCR-%'
    `);

    console.log('4. 🗑️ Limpando fornecedores fictícios (se existirem)...');
    try {
      await db.query(`
        DELETE FROM Fornecedor
        WHERE nome IN (
          'BioTech Suprimentos Ltda',
          'MedLab Equipamentos S.A.',
          'LabCorp Distribuidora',
          'Diagnósticos Unidos'
        )
      `);
    } catch (err) {
      console.log('   (Tabela Fornecedor pode não existir ainda)');
    }

    console.log('5. 🗑️ Limpando sugestões de compra fictícias (se existirem)...');
    try {
      await db.query(`DELETE FROM SugestaoCompra`);
    } catch (err) {
      console.log('   (Tabela SugestaoCompra pode não existir ainda)');
    }

    console.log('\n📊 Verificando dados restantes...');
    const result = await db.query(`
      SELECT 'Produtos' as tabela, COUNT(*) as total FROM Produto
      UNION ALL
      SELECT 'Vendas', COUNT(*) FROM Venda
      UNION ALL
      SELECT 'Pedidos', COUNT(*) FROM Pedido
      UNION ALL
      SELECT 'Fornecedores', COUNT(*) FROM Fornecedor
      UNION ALL
      SELECT 'Empresas', COUNT(*) FROM Empresa
      UNION ALL
      SELECT 'Usuários', COUNT(*) FROM Usuario
      UNION ALL
      SELECT 'Plataformas', COUNT(*) FROM Plataforma
      ORDER BY tabela
    `);

    console.log('\n📋 RESUMO FINAL:');
    result.rows.forEach(row => {
      console.log(`   ${row.tabela}: ${row.total} registros`);
    });

    console.log('\n✅ Limpeza concluída com sucesso!');
    console.log('🎯 Agora o sistema contém apenas dados reais inseridos pelo usuário.');

  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error.message);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  limparDadosFicticios()
    .then(() => {
      console.log('\n🎉 Processo finalizado!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Falha na execução:', error.message);
      process.exit(1);
    });
}

module.exports = { limparDadosFicticios };
