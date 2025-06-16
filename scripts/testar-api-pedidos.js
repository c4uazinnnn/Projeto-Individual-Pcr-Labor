const axios = require('axios');

async function testarAPIPedidos() {
  console.log('🧪 Testando API de Pedidos...\n');
  
  const baseURL = 'http://localhost:3000';
  
  try {
    // Teste 1: GET /api/pedidos
    console.log('1. 📋 Testando GET /api/pedidos...');
    try {
      const response = await axios.get(`${baseURL}/api/pedidos`);
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📊 Dados: ${response.data.data ? response.data.data.length : 0} pedidos encontrados`);
      if (response.data.data && response.data.data.length > 0) {
        console.log(`   📋 Primeiro pedido: ID ${response.data.data[0].id_pedido} - ${response.data.data[0].produto_nome || 'Sem nome'}`);
      }
    } catch (error) {
      console.log(`   ❌ Erro: ${error.response ? error.response.status : error.message}`);
    }
    
    // Teste 2: POST /api/pedidos (criar novo)
    console.log('\n2. ➕ Testando POST /api/pedidos...');
    const novoPedido = {
      id_produto: 16,
      quantidade: 50,
      fornecedor: 'Teste API',
      id_plataforma: 1,
      status: 'PENDENTE',
      data_pedido: '2025-06-16',
      valor_total: 5000
    };
    
    try {
      const response = await axios.post(`${baseURL}/api/pedidos`, novoPedido);
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📋 Pedido criado: ID ${response.data.data.id_pedido}`);
    } catch (error) {
      console.log(`   ❌ Erro: ${error.response ? error.response.status + ' - ' + error.response.data.error : error.message}`);
    }
    
    // Teste 3: Verificar se o servidor está rodando
    console.log('\n3. 🌐 Testando se o servidor está rodando...');
    try {
      const response = await axios.get(`${baseURL}/`);
      console.log(`   ✅ Servidor rodando: Status ${response.status}`);
    } catch (error) {
      console.log(`   ❌ Servidor não está rodando: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Instalar axios se não estiver instalado
const { exec } = require('child_process');
exec('npm list axios', (error, stdout, stderr) => {
  if (error) {
    console.log('📦 Instalando axios...');
    exec('npm install axios', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Erro ao instalar axios:', error.message);
        return;
      }
      console.log('✅ Axios instalado com sucesso!');
      testarAPIPedidos();
    });
  } else {
    testarAPIPedidos();
  }
});
