// services/platformIntegrationService.js

const Venda = require('../models/vendaModel');
const Produto = require('../models/produtoModel');
const Plataforma = require('../models/plataformaModel');
const Pedido = require('../models/pedidoModel');

class PlatformIntegrationService {
  
  // Simulação da API do Mercado Livre
  static async fetchMercadoLivreData() {
    try {
      console.log('🛒 Buscando dados do Mercado Livre...');
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Dados simulados que viriam da API real do ML
      return {
        platform: 'Mercado Livre',
        sales: [
          {
            order_id: 'ML' + Date.now(),
            product_sku: 'PCR-COVID-001',
            quantity: Math.floor(Math.random() * 5) + 1,
            price: 89.90,
            date: new Date(),
            status: 'paid',
            buyer: {
              nickname: 'COMPRADOR' + Math.floor(Math.random() * 1000),
              email: 'comprador@email.com'
            }
          },
          {
            order_id: 'ML' + (Date.now() + 1),
            product_sku: 'PCR-FLU-001',
            quantity: Math.floor(Math.random() * 3) + 1,
            price: 79.90,
            date: new Date(),
            status: 'paid',
            buyer: {
              nickname: 'COMPRADOR' + Math.floor(Math.random() * 1000),
              email: 'comprador2@email.com'
            }
          }
        ],
        metrics: {
          total_sales: Math.floor(Math.random() * 50) + 20,
          total_revenue: Math.floor(Math.random() * 5000) + 2000,
          active_listings: Math.floor(Math.random() * 10) + 5,
          conversion_rate: (Math.random() * 5 + 2).toFixed(2)
        }
      };
    } catch (error) {
      console.error('Erro ao buscar dados do Mercado Livre:', error);
      throw error;
    }
  }
  
  // Simulação da API da Shopee
  static async fetchShopeeData() {
    try {
      console.log('🛍️ Buscando dados da Shopee...');
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Dados simulados que viriam da API real da Shopee
      return {
        platform: 'Shopee',
        sales: [
          {
            order_id: 'SP' + Date.now(),
            product_sku: 'PCR-HEP-001',
            quantity: Math.floor(Math.random() * 4) + 1,
            price: 95.50,
            date: new Date(),
            status: 'completed',
            buyer: {
              username: 'user' + Math.floor(Math.random() * 1000),
              phone: '+55119' + Math.floor(Math.random() * 100000000)
            }
          },
          {
            order_id: 'SP' + (Date.now() + 1),
            product_sku: 'PCR-DEN-001',
            quantity: Math.floor(Math.random() * 2) + 1,
            price: 85.00,
            date: new Date(),
            status: 'completed',
            buyer: {
              username: 'user' + Math.floor(Math.random() * 1000),
              phone: '+55119' + Math.floor(Math.random() * 100000000)
            }
          }
        ],
        metrics: {
          total_sales: Math.floor(Math.random() * 40) + 15,
          total_revenue: Math.floor(Math.random() * 4000) + 1500,
          active_listings: Math.floor(Math.random() * 8) + 3,
          conversion_rate: (Math.random() * 4 + 1.5).toFixed(2)
        }
      };
    } catch (error) {
      console.error('Erro ao buscar dados da Shopee:', error);
      throw error;
    }
  }
  
  // Sincronização completa de todas as plataformas
  static async syncAllPlatforms() {
    try {
      console.log('🔄 Iniciando sincronização completa das plataformas...');
      
      const results = {
        mercadoLivre: null,
        shopee: null,
        errors: [],
        summary: {
          total_new_sales: 0,
          total_revenue: 0,
          platforms_synced: 0
        }
      };
      
      // Buscar dados do Mercado Livre
      try {
        results.mercadoLivre = await this.fetchMercadoLivreData();
        await this.processPlatformSales(results.mercadoLivre);
        results.summary.platforms_synced++;
        results.summary.total_new_sales += results.mercadoLivre.sales.length;
        results.summary.total_revenue += results.mercadoLivre.metrics.total_revenue;
      } catch (error) {
        results.errors.push(`Mercado Livre: ${error.message}`);
      }
      
      // Buscar dados da Shopee
      try {
        results.shopee = await this.fetchShopeeData();
        await this.processPlatformSales(results.shopee);
        results.summary.platforms_synced++;
        results.summary.total_new_sales += results.shopee.sales.length;
        results.summary.total_revenue += results.shopee.metrics.total_revenue;
      } catch (error) {
        results.errors.push(`Shopee: ${error.message}`);
      }
      
      console.log('✅ Sincronização completa finalizada:', results.summary);
      return results;
      
    } catch (error) {
      console.error('❌ Erro na sincronização completa:', error);
      throw error;
    }
  }
  
  // Processar vendas de uma plataforma
  static async processPlatformSales(platformData) {
    try {
      const { platform, sales } = platformData;
      
      // Buscar ID da plataforma
      const plataformas = await Plataforma.getAll();
      const plataforma = plataformas.find(p => p.nome === platform);
      
      if (!plataforma) {
        console.log(`⚠️ Plataforma não encontrada: ${platform}`);
        return;
      }
      
      for (const sale of sales) {
        await this.processSingleSale(sale, plataforma.id_plataforma);
      }
      
      console.log(`✅ Processadas ${sales.length} vendas da ${platform}`);
      
    } catch (error) {
      console.error('Erro ao processar vendas da plataforma:', error);
      throw error;
    }
  }
  
  // Processar uma venda individual
  static async processSingleSale(saleData, plataformaId) {
    try {
      // Buscar produto pelo SKU
      const produtos = await Produto.getAll();
      const produto = produtos.find(p => p.sku === saleData.product_sku);
      
      if (!produto) {
        console.log(`⚠️ Produto não encontrado: ${saleData.product_sku}`);
        return;
      }
      
      // Verificar estoque
      if (produto.estoque_atual < saleData.quantity) {
        console.log(`⚠️ Estoque insuficiente para ${produto.nome}: ${produto.estoque_atual} < ${saleData.quantity}`);
        
        // Criar pedido de reposição automático
        await this.createAutoRestockOrder(produto, saleData.quantity);
        return;
      }
      
      // Criar venda
      const vendaData = {
        id_produto: produto.id_produto,
        id_plataforma: plataformaId,
        quantidade: saleData.quantity,
        data: saleData.date.toISOString().split('T')[0],
        valor_total: saleData.quantity * saleData.price,
        order_id_externo: saleData.order_id
      };
      
      await Venda.create(vendaData);
      
      // Atualizar estoque
      const novoEstoque = produto.estoque_atual - saleData.quantity;
      await Produto.updateEstoque(produto.id_produto, novoEstoque);
      
      console.log(`✅ Venda processada: ${produto.nome} - ${saleData.quantity} unidades`);
      
    } catch (error) {
      console.error('Erro ao processar venda individual:', error);
    }
  }
  
  // Criar pedido de reposição automático
  static async createAutoRestockOrder(produto, quantidadeVendida) {
    try {
      // Calcular quantidade sugerida (estoque atual + vendido + margem de segurança)
      const quantidadeSugerida = Math.max(50, produto.estoque_atual + quantidadeVendida + 20);
      
      const pedidoData = {
        id_produto: produto.id_produto,
        id_plataforma: 1, // PCR Labor interno
        quantidade: quantidadeSugerida,
        status: 'pendente',
        data_pedido: new Date().toISOString().split('T')[0],
        valor_total: quantidadeSugerida * produto.preco * 0.7 // Custo estimado
      };
      
      await Pedido.create(pedidoData);
      
      console.log(`📦 Pedido de reposição criado para ${produto.nome}: ${quantidadeSugerida} unidades`);
      
    } catch (error) {
      console.error('Erro ao criar pedido de reposição:', error);
    }
  }
  
  // Obter métricas consolidadas de todas as plataformas
  static async getConsolidatedMetrics() {
    try {
      const [vendas, produtos, plataformas] = await Promise.all([
        Venda.getAll(),
        Produto.getAll(),
        Plataforma.getVendasPorPlataforma()
      ]);
      
      // Calcular métricas consolidadas
      const metrics = {
        total_products: produtos.length,
        low_stock_products: produtos.filter(p => p.estoque_atual <= 10).length,
        total_sales: vendas.length,
        total_revenue: vendas.reduce((total, v) => total + parseFloat(v.valor_total || 0), 0),
        platforms: plataformas.map(p => ({
          name: p.nome,
          sales: parseInt(p.total_vendas || 0),
          revenue: parseFloat(p.valor_total || 0),
          products: parseInt(p.quantidade_total || 0)
        })),
        top_products: this.getTopProducts(vendas, produtos),
        sales_trend: await this.getSalesTrend()
      };
      
      return metrics;
      
    } catch (error) {
      console.error('Erro ao obter métricas consolidadas:', error);
      throw error;
    }
  }
  
  // Obter produtos mais vendidos
  static getTopProducts(vendas, produtos) {
    const productSales = {};
    
    vendas.forEach(venda => {
      if (!productSales[venda.id_produto]) {
        productSales[venda.id_produto] = {
          quantidade: 0,
          revenue: 0
        };
      }
      productSales[venda.id_produto].quantidade += venda.quantidade;
      productSales[venda.id_produto].revenue += parseFloat(venda.valor_total || 0);
    });
    
    return Object.entries(productSales)
      .map(([id_produto, data]) => {
        const produto = produtos.find(p => p.id_produto == id_produto);
        return {
          nome: produto ? produto.nome : 'Produto não encontrado',
          sku: produto ? produto.sku : 'N/A',
          quantidade_vendida: data.quantidade,
          revenue: data.revenue
        };
      })
      .sort((a, b) => b.quantidade_vendida - a.quantidade_vendida)
      .slice(0, 5);
  }
  
  // Obter tendência de vendas
  static async getSalesTrend() {
    try {
      const vendas = await Venda.getVendasPorMes();
      return vendas.map(v => ({
        month: v.mes,
        sales: parseInt(v.total_vendas || 0),
        revenue: parseFloat(v.valor_total || 0)
      }));
    } catch (error) {
      console.error('Erro ao obter tendência de vendas:', error);
      return [];
    }
  }
}

module.exports = PlatformIntegrationService;
