const axios = require('axios');

async function testarPaginaPedidos() {
  console.log('🧪 Testando página de pedidos...\n');
  
  try {
    // Teste 1: Verificar se a página carrega
    console.log('1. 🌐 Testando carregamento da página /pedidos...');
    const response = await axios.get('http://localhost:3000/pedidos');
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   📄 Tamanho da resposta: ${response.data.length} caracteres`);
    
    // Verificar se os dados estão sendo passados para o frontend
    const pedidosMatch = response.data.match(/let pedidosOriginais = (.*?);/);
    if (pedidosMatch) {
      try {
        const pedidosData = JSON.parse(pedidosMatch[1]);
        console.log(`   📊 Dados encontrados na página: ${pedidosData.length} pedidos`);
        if (pedidosData.length > 0) {
          console.log(`   📋 Primeiro pedido: ID ${pedidosData[0].id_pedido} - ${pedidosData[0].produto_nome}`);
        }
      } catch (e) {
        console.log(`   ❌ Erro ao parsear dados: ${e.message}`);
        console.log(`   📄 Dados brutos: ${pedidosMatch[1].substring(0, 100)}...`);
      }
    } else {
      console.log('   ❌ Dados de pedidos não encontrados na página');
    }
    
    // Teste 2: Verificar se há erros JavaScript na página
    const jsErrors = response.data.match(/console\.error|throw|Error:/g);
    if (jsErrors) {
      console.log(`   ⚠️ Possíveis erros JavaScript encontrados: ${jsErrors.length}`);
    } else {
      console.log('   ✅ Nenhum erro JavaScript óbvio encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar página:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Dados: ${error.response.data.substring(0, 200)}...`);
    }
  }
}

testarPaginaPedidos();
