const axios = require('axios');

async function simularRecebimentoPedido() {
  console.log('🧪 SIMULANDO RECEBIMENTO DE PEDIDO\n');
  
  const baseURL = 'http://localhost:3000';
  
  try {
    // 1. Buscar um pedido PENDENTE
    console.log('1. 📋 Buscando pedidos PENDENTES...');
    const response = await axios.get(`${baseURL}/api/pedidos`);
    
    if (!response.data.success) {
      console.log('❌ Erro ao buscar pedidos:', response.data.error);
      return;
    }
    
    const pedidos = response.data.data;
    const pedidoPendente = pedidos.find(p => p.status === 'PENDENTE');
    
    if (!pedidoPendente) {
      console.log('❌ Nenhum pedido PENDENTE encontrado');
      console.log(`📊 Status dos pedidos:`, pedidos.map(p => `#${p.id_pedido}: ${p.status}`));
      return;
    }
    
    console.log(`✅ Pedido PENDENTE encontrado: #${pedidoPendente.id_pedido}`);
    console.log(`📦 Produto: ${pedidoPendente.produto_nome} (ID: ${pedidoPendente.id_produto})`);
    console.log(`📊 Quantidade: ${pedidoPendente.quantidade}`);
    
    // 2. Aprovar o pedido
    console.log(`\n2. ✅ Aprovando pedido #${pedidoPendente.id_pedido}...`);
    
    const dadosAprovacao = {
      id_produto: pedidoPendente.id_produto,
      id_plataforma: pedidoPendente.id_plataforma,
      quantidade: pedidoPendente.quantidade,
      status: 'APROVADO',
      data_pedido: pedidoPendente.data_pedido,
      valor_total: pedidoPendente.valor_total,
      fornecedor: pedidoPendente.fornecedor
    };
    
    const aprovacaoResponse = await axios.put(`${baseURL}/api/pedidos/${pedidoPendente.id_pedido}`, dadosAprovacao);
    
    if (aprovacaoResponse.data.success) {
      console.log(`✅ Pedido aprovado com sucesso!`);
    } else {
      console.log(`❌ Erro ao aprovar:`, aprovacaoResponse.data.error);
      return;
    }
    
    // 3. Verificar estoque antes do recebimento
    console.log(`\n3. 📦 Verificando estoque antes do recebimento...`);
    const estoqueAntes = await axios.get(`${baseURL}/api/produtos/${pedidoPendente.id_produto}`);
    
    if (estoqueAntes.data.success) {
      const produto = estoqueAntes.data.data;
      console.log(`📊 Estoque atual: ${produto.estoque_atual}`);
      console.log(`📦 Produto: ${produto.nome} (${produto.sku})`);
      
      // 4. Marcar como recebido
      console.log(`\n4. 📦 Marcando pedido como RECEBIDO...`);
      
      const dadosRecebimento = {
        id_produto: pedidoPendente.id_produto,
        id_plataforma: pedidoPendente.id_plataforma,
        quantidade: pedidoPendente.quantidade,
        status: 'ENTREGUE',
        data_pedido: pedidoPendente.data_pedido,
        valor_total: pedidoPendente.valor_total,
        fornecedor: pedidoPendente.fornecedor
      };
      
      console.log(`📤 Dados para recebimento:`, dadosRecebimento);
      
      const recebimentoResponse = await axios.put(`${baseURL}/api/pedidos/${pedidoPendente.id_pedido}`, dadosRecebimento);
      
      if (recebimentoResponse.data.success) {
        console.log(`✅ Pedido marcado como RECEBIDO!`);
        
        // 5. Verificar estoque depois
        console.log(`\n5. 📊 Verificando estoque após recebimento...`);
        const estoqueDepois = await axios.get(`${baseURL}/api/produtos/${pedidoPendente.id_produto}`);
        
        if (estoqueDepois.data.success) {
          const produtoDepois = estoqueDepois.data.data;
          console.log(`📊 Estoque anterior: ${produto.estoque_atual}`);
          console.log(`📊 Estoque atual: ${produtoDepois.estoque_atual}`);
          console.log(`📈 Diferença: ${produtoDepois.estoque_atual - produto.estoque_atual}`);
          console.log(`🎯 Quantidade esperada: +${pedidoPendente.quantidade}`);
          
          if (produtoDepois.estoque_atual === produto.estoque_atual + parseInt(pedidoPendente.quantidade)) {
            console.log(`✅ ESTOQUE ATUALIZADO CORRETAMENTE!`);
          } else {
            console.log(`❌ ESTOQUE NÃO FOI ATUALIZADO CORRETAMENTE`);
          }
        }
      } else {
        console.log(`❌ Erro ao marcar como recebido:`, recebimentoResponse.data.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro na simulação:', error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Dados:`, error.response.data);
    }
  }
}

// Aguardar um pouco para o servidor iniciar
setTimeout(() => {
  simularRecebimentoPedido();
}, 2000);
