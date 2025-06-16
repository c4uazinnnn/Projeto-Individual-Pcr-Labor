const db = require('../config/db');

async function debugPedidosCompleto() {
  console.log('🔍 DEBUG COMPLETO - SISTEMA DE PEDIDOS\n');
  
  try {
    // 1. Verificar dados no banco
    console.log('1. 📊 DADOS NO BANCO:');
    
    const pedidosBanco = await db.query(`
      SELECT 
        p.*,
        prod.nome as produto_nome,
        prod.sku,
        prod.id_empresa,
        plat.nome as plataforma_nome
      FROM Pedido p
      LEFT JOIN Produto prod ON p.id_produto = prod.id_produto
      LEFT JOIN Plataforma plat ON p.id_plataforma = plat.id_plataforma
      ORDER BY p.created_at DESC
      LIMIT 10
    `);
    
    console.log(`   Total de pedidos no banco: ${pedidosBanco.rows.length}`);
    pedidosBanco.rows.forEach(p => {
      console.log(`   - ID: ${p.id_pedido} | Produto: ${p.produto_nome} (ID: ${p.id_produto}) | Empresa: ${p.id_empresa} | Valor: R$ ${p.valor_total}`);
    });
    
    // 2. Testar query do modelo com filtro de empresa
    console.log('\n2. 🔍 TESTANDO QUERY DO MODELO:');
    
    const queryModelo = `
      SELECT
        p.*,
        prod.nome as produto_nome,
        prod.sku,
        plat.nome as plataforma_nome
      FROM Pedido p
      LEFT JOIN Produto prod ON p.id_produto = prod.id_produto
      LEFT JOIN Plataforma plat ON p.id_plataforma = plat.id_plataforma
      WHERE prod.id_empresa = $1
      ORDER BY p.created_at DESC
    `;
    
    const resultadoEmpresa6 = await db.query(queryModelo, [6]);
    console.log(`   Pedidos para empresa 6: ${resultadoEmpresa6.rows.length}`);
    resultadoEmpresa6.rows.forEach(p => {
      console.log(`   - ID: ${p.id_pedido} | ${p.produto_nome} | Valor: R$ ${p.valor_total}`);
    });
    
    // 3. Testar modelo diretamente
    console.log('\n3. 🧪 TESTANDO MODELO DIRETAMENTE:');
    const Pedido = require('../models/modeloPedidos');
    
    const pedidosModelo = await Pedido.getAll(6);
    console.log(`   Resultado do modelo: ${pedidosModelo.length} pedidos`);
    pedidosModelo.forEach(p => {
      console.log(`   - ID: ${p.id_pedido} | ${p.produto_nome} | Valor: R$ ${p.valor_total}`);
    });
    
    // 4. Testar controlador diretamente
    console.log('\n4. 🎮 TESTANDO CONTROLADOR:');
    const controladorPedidos = require('../controllers/controladorPedidos');
    
    // Simular req e res
    const mockReq = {
      id_empresa: 6,
      usuario: { empresa_nome: 'Teste supremo' }
    };
    
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log(`   Status: ${code}`);
          console.log(`   Dados: ${JSON.stringify(data, null, 2)}`);
        }
      }),
      json: (data) => {
        console.log(`   Dados: ${JSON.stringify(data, null, 2)}`);
      }
    };
    
    await controladorPedidos.getAllPedidos(mockReq, mockRes);
    
    // 5. Verificar se há problemas na estrutura da tabela
    console.log('\n5. 🏗️ ESTRUTURA DA TABELA:');
    const estrutura = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'pedido'
      ORDER BY ordinal_position
    `);
    
    console.log('   Colunas da tabela Pedido:');
    estrutura.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });
    
  } catch (error) {
    console.error('❌ Erro no debug:', error.message);
    console.error(error.stack);
  }
  
  process.exit(0);
}

debugPedidosCompleto();
