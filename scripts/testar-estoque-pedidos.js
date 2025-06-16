const db = require('../config/db');

async function testarEstoquePedidos() {
  console.log('🧪 TESTE COMPLETO - ESTOQUE E PEDIDOS\n');
  
  try {
    // 1. Verificar produtos disponíveis
    console.log('1. 📦 PRODUTOS DISPONÍVEIS:');
    const produtos = await db.query(`
      SELECT id_produto, nome, sku, estoque_atual, id_empresa
      FROM Produto 
      WHERE id_empresa = 6
      ORDER BY id_produto
      LIMIT 5
    `);
    
    console.log(`   Total de produtos: ${produtos.rows.length}`);
    produtos.rows.forEach(p => {
      console.log(`   - ID: ${p.id_produto} | ${p.nome} (${p.sku}) | Estoque: ${p.estoque_atual}`);
    });
    
    if (produtos.rows.length === 0) {
      console.log('❌ Nenhum produto encontrado para empresa 6');
      return;
    }
    
    // 2. Verificar pedidos APROVADOS
    console.log('\n2. 📋 PEDIDOS APROVADOS:');
    const pedidosAprovados = await db.query(`
      SELECT 
        p.id_pedido,
        p.id_produto,
        p.quantidade,
        p.status,
        prod.nome as produto_nome,
        prod.estoque_atual
      FROM Pedido p
      LEFT JOIN Produto prod ON p.id_produto = prod.id_produto
      WHERE p.status = 'APROVADO' AND prod.id_empresa = 6
      LIMIT 3
    `);
    
    console.log(`   Pedidos aprovados: ${pedidosAprovados.rows.length}`);
    pedidosAprovados.rows.forEach(p => {
      console.log(`   - Pedido #${p.id_pedido} | ${p.produto_nome} | Qtd: ${p.quantidade} | Estoque atual: ${p.estoque_atual}`);
    });
    
    // 3. Testar atualização de estoque manualmente
    if (produtos.rows.length > 0) {
      const produtoTeste = produtos.rows[0];
      console.log(`\n3. 🧪 TESTE DE ATUALIZAÇÃO DE ESTOQUE:`);
      console.log(`   Produto teste: ${produtoTeste.nome} (ID: ${produtoTeste.id_produto})`);
      console.log(`   Estoque atual: ${produtoTeste.estoque_atual}`);
      
      const novoEstoque = parseInt(produtoTeste.estoque_atual) + 10;
      console.log(`   Novo estoque (teste): ${novoEstoque}`);
      
      try {
        const resultado = await db.query(
          'UPDATE Produto SET estoque_atual = $1, updated_at = CURRENT_TIMESTAMP WHERE id_produto = $2 RETURNING *',
          [novoEstoque, produtoTeste.id_produto]
        );
        
        if (resultado.rows.length > 0) {
          console.log(`   ✅ Estoque atualizado: ${produtoTeste.estoque_atual} → ${resultado.rows[0].estoque_atual}`);
          
          // Reverter para o valor original
          await db.query(
            'UPDATE Produto SET estoque_atual = $1 WHERE id_produto = $2',
            [produtoTeste.estoque_atual, produtoTeste.id_produto]
          );
          console.log(`   🔄 Estoque revertido para valor original: ${produtoTeste.estoque_atual}`);
        } else {
          console.log(`   ❌ Nenhuma linha foi atualizada`);
        }
      } catch (error) {
        console.error(`   ❌ Erro no teste de estoque:`, error.message);
      }
    }
    
    // 4. Testar modelo de produtos
    console.log(`\n4. 🧪 TESTE DO MODELO DE PRODUTOS:`);
    try {
      const Produto = require('../models/modeloProdutos');
      
      if (produtos.rows.length > 0) {
        const produtoTeste = produtos.rows[0];
        console.log(`   Testando getById(${produtoTeste.id_produto})...`);
        
        const produtoModelo = await Produto.getById(produtoTeste.id_produto);
        if (produtoModelo) {
          console.log(`   ✅ Produto encontrado: ${produtoModelo.nome} | Estoque: ${produtoModelo.estoque_atual}`);
          
          // Testar updateEstoque
          const estoqueOriginal = parseInt(produtoModelo.estoque_atual);
          const estoqueTestE = estoqueOriginal + 5;
          
          console.log(`   Testando updateEstoque(${produtoTeste.id_produto}, ${estoqueTestE})...`);
          const produtoAtualizado = await Produto.updateEstoque(produtoTeste.id_produto, estoqueTestE);
          
          if (produtoAtualizado) {
            console.log(`   ✅ updateEstoque funcionou: ${estoqueOriginal} → ${produtoAtualizado.estoque_atual}`);
            
            // Reverter
            await Produto.updateEstoque(produtoTeste.id_produto, estoqueOriginal);
            console.log(`   🔄 Estoque revertido para: ${estoqueOriginal}`);
          } else {
            console.log(`   ❌ updateEstoque retornou null`);
          }
        } else {
          console.log(`   ❌ Produto não encontrado pelo modelo`);
        }
      }
    } catch (error) {
      console.error(`   ❌ Erro no teste do modelo:`, error.message);
    }
    
    console.log('\n✅ TESTE COMPLETO FINALIZADO');
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error.message);
    console.error(error.stack);
  }
  
  process.exit(0);
}

testarEstoquePedidos();
