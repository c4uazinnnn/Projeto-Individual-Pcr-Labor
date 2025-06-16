// services/dataIntegrationService.js

const Venda = require('../models/modeloVendas');
const Produto = require('../models/modeloProdutos');
const Plataforma = require('../models/modeloPlataformas');

class DataIntegrationService {

  // Simular integração com APIs das plataformas
  static async syncPlatformData(id_empresa = null) {
    try {
      console.log('🔄 Iniciando sincronização de dados das plataformas...');

      // Simular dados reais das plataformas
      const platformData = await this.fetchPlatformData();

      // Processar e salvar vendas
      for (const sale of platformData.sales) {
        await this.processSale(sale, id_empresa);
      }

      // Atualizar estoque baseado nas vendas
      await this.updateStockLevels(id_empresa);

      console.log('✅ Sincronização concluída com sucesso!');
      return { success: true, message: 'Dados sincronizados' };

    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      return { success: false, error: error.message };
    }
  }

  // Simular busca de dados das plataformas (APIs reais)
  static async fetchPlatformData() {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Dados simulados que viriam das APIs reais
    return {
      sales: [
        {
          platform: 'Mercado Livre',
          product_sku: 'PCR-COVID-001',
          quantity: Math.floor(Math.random() * 10) + 1,
          price: 89.90,
          date: new Date(),
          order_id: 'ML' + Date.now()
        },
        {
          platform: 'Shopee',
          product_sku: 'PCR-FLU-001',
          quantity: Math.floor(Math.random() * 8) + 1,
          price: 79.90,
          date: new Date(),
          order_id: 'SP' + Date.now()
        },
        {
          platform: 'Site Próprio',
          product_sku: 'PCR-HEP-001',
          quantity: Math.floor(Math.random() * 5) + 1,
          price: 95.50,
          date: new Date(),
          order_id: 'WEB' + Date.now()
        }
      ]
    };
  }

  // Processar uma venda individual
  static async processSale(saleData, id_empresa = null) {
    try {
      // Buscar produto pelo SKU (filtrado por empresa se especificado)
      const produtos = await Produto.getAll(id_empresa);
      const produto = produtos.find(p => p.sku === saleData.product_sku);

      if (!produto) {
        console.log(`⚠️ Produto não encontrado: ${saleData.product_sku}`);
        return;
      }

      // Buscar plataforma
      const plataformas = await Plataforma.getAll();
      const plataforma = plataformas.find(p => p.nome === saleData.platform);

      if (!plataforma) {
        console.log(`⚠️ Plataforma não encontrada: ${saleData.platform}`);
        return;
      }

      // Verificar se há estoque suficiente
      if (produto.estoque_atual < saleData.quantity) {
        console.log(`⚠️ Estoque insuficiente para ${produto.nome}: ${produto.estoque_atual} < ${saleData.quantity}`);
        return;
      }

      // Criar venda
      const vendaData = {
        id_produto: produto.id_produto,
        id_plataforma: plataforma.id_plataforma,
        quantidade: saleData.quantity,
        data: saleData.date.toISOString().split('T')[0],
        valor_total: saleData.quantity * saleData.price
      };

      await Venda.create(vendaData);

      // Atualizar estoque
      const novoEstoque = produto.estoque_atual - saleData.quantity;
      await Produto.updateEstoque(produto.id_produto, novoEstoque);

      console.log(`✅ Venda processada: ${produto.nome} - ${saleData.quantity} unidades`);

    } catch (error) {
      console.error('Erro ao processar venda:', error);
    }
  }

  // Atualizar níveis de estoque e gerar alertas
  static async updateStockLevels(id_empresa = null) {
    try {
      const produtos = await Produto.getAll(id_empresa);
      const produtosEstoqueBaixo = produtos.filter(p => p.estoque_atual <= 10);

      if (produtosEstoqueBaixo.length > 0) {
        console.log(`⚠️ ${produtosEstoqueBaixo.length} produtos com estoque baixo:`);
        produtosEstoqueBaixo.forEach(p => {
          console.log(`   - ${p.nome}: ${p.estoque_atual} unidades`);
        });

        // Aqui você poderia enviar notificações, emails, etc.
        await this.generateStockAlerts(produtosEstoqueBaixo);
      }

    } catch (error) {
      console.error('Erro ao atualizar níveis de estoque:', error);
    }
  }

  // Gerar alertas de estoque
  static async generateStockAlerts(produtos) {
    // Implementar sistema de alertas (email, SMS, notificações push, etc.)
    console.log('📧 Gerando alertas de estoque baixo...');

    // Simular envio de alertas
    for (const produto of produtos) {
      console.log(`📨 Alerta enviado para: ${produto.nome} (${produto.estoque_atual} unidades)`);
    }
  }

  // Calcular métricas em tempo real
  static async calculateMetrics(id_empresa = null) {
    try {
      console.log('🔍 ServicoIntegracaoDados.calculateMetrics() chamado com id_empresa:', id_empresa);

      const [produtos, vendas, plataformas] = await Promise.all([
        Produto.getAll(id_empresa),
        Venda.getAll(id_empresa),
        Plataforma.getVendasPorPlataforma(id_empresa) // FILTRADO POR EMPRESA
      ]);

      console.log('📊 Dados retornados pelos modelos:');
      console.log(`   - Produtos: ${produtos.length}`);
      console.log(`   - Vendas: ${vendas.length}`);
      console.log(`   - Plataformas: ${plataformas.length}`);

      // Calcular métricas
      const totalProdutos = produtos.length;
      const produtosEstoqueBaixo = produtos.filter(p => p.estoque_atual <= 10).length;
      const totalVendas = vendas.length;
      const valorTotalVendas = vendas.reduce((total, v) => total + parseFloat(v.valor_total || 0), 0);

      // Vendas do dia
      const hoje = new Date().toISOString().split('T')[0];
      const vendasHoje = vendas.filter(v => {
        const dataVenda = new Date(v.data).toISOString().split('T')[0];
        return dataVenda === hoje;
      }).length;

      // Ticket médio
      const ticketMedio = totalVendas > 0 ? valorTotalVendas / totalVendas : 0;

      // Produto mais vendido
      const vendasPorProduto = {};
      vendas.forEach(v => {
        if (!vendasPorProduto[v.produto_nome]) {
          vendasPorProduto[v.produto_nome] = 0;
        }
        vendasPorProduto[v.produto_nome] += v.quantidade;
      });

      const produtoMaisVendido = Object.entries(vendasPorProduto)
        .sort((a, b) => b[1] - a[1])[0];

      return {
        totalProdutos,
        produtosEstoqueBaixo,
        totalVendas,
        vendasHoje,
        valorTotalVendas,
        ticketMedio,
        produtoMaisVendido: produtoMaisVendido ? produtoMaisVendido[0] : 'N/A',
        plataformas: plataformas.map(p => ({
          ...p,
          valor_total: parseFloat(p.valor_total || 0),
          total_vendas: parseInt(p.total_vendas || 0),
          quantidade_total: parseInt(p.quantidade_total || 0)
        }))
      };

    } catch (error) {
      console.error('Erro ao calcular métricas:', error);
      throw error;
    }
  }

  // Simular reposição automática de estoque
  static async autoRestockSuggestions(id_empresa = null) {
    try {
      const produtos = await Produto.getAll(id_empresa);
      const suggestions = [];

      for (const produto of produtos) {
        if (produto.estoque_atual <= 10) {
          // Calcular sugestão baseada no histórico de vendas
          const vendas = await Venda.getAll(id_empresa);
          const vendasProduto = vendas.filter(v => v.id_produto === produto.id_produto);

          // Média de vendas dos últimos 30 dias
          const vendas30Dias = vendasProduto.filter(v => {
            const dataVenda = new Date(v.data);
            const agora = new Date();
            const diffTime = Math.abs(agora - dataVenda);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 30;
          });

          const mediaVendas = vendas30Dias.length > 0
            ? vendas30Dias.reduce((total, v) => total + v.quantidade, 0) / 30
            : 5;

          // Sugerir estoque para 60 dias
          const sugestaoQuantidade = Math.ceil(mediaVendas * 60);

          suggestions.push({
            produto: produto.nome,
            sku: produto.sku,
            estoque_atual: produto.estoque_atual,
            quantidade_sugerida: sugestaoQuantidade,
            motivo: `Baseado na média de ${mediaVendas.toFixed(1)} vendas/dia`
          });
        }
      }

      return suggestions;

    } catch (error) {
      console.error('Erro ao gerar sugestões de reposição:', error);
      return [];
    }
  }
}

module.exports = DataIntegrationService;
