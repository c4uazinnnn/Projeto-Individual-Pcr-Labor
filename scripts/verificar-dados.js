const db = require('../config/db');

async function verificarDados() {
  try {
    console.log('🔍 Verificando dados do sistema...\n');
    
    // Verificar empresas
    const empresas = await db.query('SELECT * FROM Empresa ORDER BY id_empresa');
    console.log('📊 EMPRESAS:');
    empresas.rows.forEach(emp => {
      console.log(`   ID: ${emp.id_empresa} | Nome: ${emp.nome_fantasia} | CNPJ: ${emp.cnpj}`);
    });
    
    // Verificar produtos
    const produtos = await db.query('SELECT id_produto, nome, sku, id_empresa FROM Produto ORDER BY id_empresa, id_produto');
    console.log('\n📦 PRODUTOS:');
    produtos.rows.forEach(prod => {
      console.log(`   ID: ${prod.id_produto} | Nome: ${prod.nome} | SKU: ${prod.sku} | Empresa: ${prod.id_empresa}`);
    });
    
    // Verificar pedidos
    const pedidos = await db.query('SELECT id_pedido, id_produto, fornecedor, valor_total, created_at FROM Pedido ORDER BY created_at DESC LIMIT 10');
    console.log('\n🛒 ÚLTIMOS PEDIDOS:');
    pedidos.rows.forEach(ped => {
      console.log(`   ID: ${ped.id_pedido} | Produto: ${ped.id_produto} | Fornecedor: ${ped.fornecedor} | Valor: R$ ${ped.valor_total} | Data: ${ped.created_at}`);
    });
    
    // Verificar usuários
    const usuarios = await db.query('SELECT id_usuario, nome, email, id_empresa FROM Usuario ORDER BY id_usuario');
    console.log('\n👤 USUÁRIOS:');
    usuarios.rows.forEach(user => {
      console.log(`   ID: ${user.id_usuario} | Nome: ${user.nome} | Email: ${user.email} | Empresa: ${user.id_empresa}`);
    });
    
    // Verificar query problemática
    console.log('\n🔍 TESTANDO QUERY PROBLEMÁTICA:');
    const queryProblematica = `
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
    
    const resultadoEmpresa6 = await db.query(queryProblematica, [6]);
    console.log(`   Pedidos para empresa 6: ${resultadoEmpresa6.rows.length}`);
    resultadoEmpresa6.rows.forEach(ped => {
      console.log(`     - Pedido ${ped.id_pedido}: ${ped.produto_nome} (${ped.sku})`);
    });
    
    // Testar sem filtro de empresa
    const querySemFiltro = `
      SELECT
        p.*,
        prod.nome as produto_nome,
        prod.sku,
        plat.nome as plataforma_nome
      FROM Pedido p
      LEFT JOIN Produto prod ON p.id_produto = prod.id_produto
      LEFT JOIN Plataforma plat ON p.id_plataforma = plat.id_plataforma
      ORDER BY p.created_at DESC
    `;
    
    const resultadoSemFiltro = await db.query(querySemFiltro);
    console.log(`\n   Todos os pedidos (sem filtro): ${resultadoSemFiltro.rows.length}`);
    resultadoSemFiltro.rows.forEach(ped => {
      console.log(`     - Pedido ${ped.id_pedido}: Produto ${ped.id_produto} | Empresa do produto: ${ped.produto_nome ? 'OK' : 'NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
  
  process.exit(0);
}

verificarDados();
