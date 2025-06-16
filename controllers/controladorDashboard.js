// controllers/dashboardController.js

const Produto = require('../models/modeloProdutos');
const Venda = require('../models/modeloVendas');
const Plataforma = require('../models/modeloPlataformas');
const ServicoIntegracaoDados = require('../services/servicoIntegracaoDados');

const renderDashboard = async (req, res) => {
  try {
    console.log('🔄 Carregando dashboard com dados em tempo real...');

    // Obter dados da empresa do usuário logado
    const id_empresa = req.id_empresa; // Vem do middleware
    const usuario = req.usuario; // Vem do middleware

    console.log(`👤 Dashboard para: ${usuario.nome} (${usuario.empresa_nome})`);

    // Buscar TODOS os dados necessários FILTRADOS POR EMPRESA
    console.log(`📦 Buscando dados da empresa ID: ${id_empresa}`);

    const [produtos, vendas, pedidos, plataformas] = await Promise.all([
      Produto.getAll(id_empresa).catch(() => []), // FILTRADO POR EMPRESA
      Venda.getAll(id_empresa).catch(() => []),   // FILTRADO POR EMPRESA
      require('../models/modeloPedidos').getAll(id_empresa).catch(() => []), // FILTRADO POR EMPRESA
      require('../models/modeloPlataformas').getVendasPorPlataforma(id_empresa).catch(() => []) // FILTRADO POR EMPRESA
    ]);

    console.log(`✅ Produtos encontrados: ${produtos.length}`);
    console.log(`✅ Vendas encontradas: ${vendas.length}`);

    // Debug dos dados
    if (produtos.length > 0) {
      console.log('📦 Primeiro produto:', produtos[0]);
    }
    if (vendas.length > 0) {
      console.log('💰 Primeira venda:', vendas[0]);
    }

    // Calcular métricas diretamente
    const totalProdutos = produtos.length;
    const produtosEstoqueBaixo = produtos.filter(p => (p.estoque_atual || 0) <= 10).length;
    const totalVendas = vendas.length;
    const valorTotalVendas = vendas.reduce((total, v) => {
      const valor = parseFloat(v.valor_total || 0);
      console.log(`💰 Somando venda: R$ ${valor}`);
      return total + valor;
    }, 0);

    console.log(`📊 Valor total calculado: R$ ${valorTotalVendas}`);

    // Vendas do dia
    const hoje = new Date().toISOString().split('T')[0];
    const vendasHoje = vendas.filter(v => {
      if (!v.data && !v.data_venda) return false;
      const dataVenda = v.data || v.data_venda;
      const dataFormatada = new Date(dataVenda).toISOString().split('T')[0];
      return dataFormatada === hoje;
    }).length;

    // Calcular crescimento real baseado em dados históricos
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const ontemStr = ontem.toISOString().split('T')[0];

    const vendasOntem = vendas.filter(v => {
      if (!v.data && !v.data_venda) return false;
      const dataVenda = v.data || v.data_venda;
      const dataFormatada = new Date(dataVenda).toISOString().split('T')[0];
      return dataFormatada === ontemStr;
    });

    const valorOntem = vendasOntem.reduce((total, v) => total + parseFloat(v.valor_total || 0), 0);
    const valorHoje = vendas.filter(v => {
      if (!v.data && !v.data_venda) return false;
      const dataVenda = v.data || v.data_venda;
      const dataFormatada = new Date(dataVenda).toISOString().split('T')[0];
      return dataFormatada === hoje;
    }).reduce((total, v) => total + parseFloat(v.valor_total || 0), 0);

    // Calcular crescimento com proteção contra valores extremos
    let crescimentoDiario = 0;
    if (valorOntem > 0) {
      crescimentoDiario = ((valorHoje - valorOntem) / valorOntem * 100);
      // Limitar valores extremos
      if (crescimentoDiario > 999) crescimentoDiario = 999;
      if (crescimentoDiario < -999) crescimentoDiario = -999;
    } else if (valorHoje > 0) {
      // Se não havia vendas ontem mas há hoje, considerar 100% de crescimento
      crescimentoDiario = 100;
    }

    // Ticket médio
    const ticketMedio = totalVendas > 0 ? valorTotalVendas / totalVendas : 0;

    // Produto mais vendido
    const vendasPorProduto = {};
    vendas.forEach(v => {
      const nomeProduto = v.produto_nome || 'Produto Desconhecido';
      if (!vendasPorProduto[nomeProduto]) {
        vendasPorProduto[nomeProduto] = 0;
      }
      vendasPorProduto[nomeProduto] += parseInt(v.quantidade || 0);
    });

    const produtoMaisVendido = Object.entries(vendasPorProduto).length > 0
      ? Object.entries(vendasPorProduto).sort((a, b) => b[1] - a[1])[0][0]
      : 'N/A';

    // Valor total dos pedidos REAL
    const valorTotalPedidos = pedidos.reduce((total, pedido) => {
      return total + parseFloat(pedido.valor_total || 0);
    }, 0);

    const stats = {
      totalProdutos,
      produtosEstoqueBaixo,
      totalVendas,
      totalPedidos: pedidos.length,
      vendasHoje,
      valorTotalVendas,
      valorTotalPedidos,
      ticketMedio,
      produtoMaisVendido,
      crescimentoDiario: crescimentoDiario.toFixed(1),
      valorHoje,
      valorOntem,
      plataformas: plataformas.slice(0, 3) // Top 3 plataformas
    };

    console.log('📊 Métricas calculadas:', stats);

    if (produtos.length > 0) {
      console.log(`📋 Primeiro produto: ${produtos[0].nome} (Estoque: ${produtos[0].estoque_atual})`);
    }
    if (vendas.length > 0) {
      console.log(`📋 Primeira venda: ${vendas[0].produto_nome} (Valor: R$ ${vendas[0].valor_total})`);
    }

    console.log('✅ Dashboard carregado com métricas calculadas');

    res.render('pages/dashboard', {
      pageTitle: `Dashboard - ${usuario.empresa_nome}`,
      currentPage: 'dashboard',
      stats,
      produtos: produtos.slice(0, 5),
      vendas: vendas.slice(0, 10),
      pedidos: pedidos.slice(0, 5),
      plataformas: plataformas.slice(0, 3),
      lastUpdate: new Date().toLocaleString('pt-BR'),
      usuario
    });
  } catch (error) {
    console.error('❌ Erro ao carregar dashboard:', error);

    // Fallback para dados básicos se houver erro
    try {
      const usuario = req.session.usuario;
      const id_empresa = usuario ? usuario.id_empresa : 1; // Fallback para empresa 1

      const [produtos, vendas, plataformas] = await Promise.all([
        Produto.getAll(id_empresa),
        Venda.getAll(id_empresa),
        Plataforma.getVendasPorPlataforma(id_empresa) // FILTRADO POR EMPRESA
      ]);

      const stats = {
        totalProdutos: produtos.length,
        produtosEstoqueBaixo: produtos.filter(p => p.estoque_atual <= 10).length,
        totalVendas: vendas.length,
        vendasHoje: 0,
        valorTotalVendas: vendas.reduce((total, v) => total + parseFloat(v.valor_total || 0), 0),
        ticketMedio: 0,
        produtoMaisVendido: 'N/A'
      };

      res.render('pages/dashboard-correct', {
        pageTitle: 'Dashboard - PCR Labor',
        currentPage: 'dashboard',
        stats,
        produtos: produtos.slice(0, 5),
        vendas: vendas.slice(0, 10),
        plataformas: plataformas.map(p => ({
          ...p,
          valor_total: parseFloat(p.valor_total || 0)
        })),
        sugestoes: [],
        lastUpdate: new Date().toLocaleString('pt-BR'),
        warning: 'Dados em modo básico - algumas funcionalidades podem estar limitadas'
      });
    } catch (fallbackError) {
      res.status(500).render('pages/error', {
        pageTitle: 'Erro - PCR Labor',
        error: 'Erro ao carregar dashboard: ' + error.message
      });
    }
  }
};

const renderLogin = (req, res) => {
  try {
    res.render('pages/login', {
      pageTitle: 'Login - PCR Labor',
      currentPage: 'login'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao carregar página de login'
    });
  }
};

const processLogin = async (req, res) => {
  try {
    const { email, senha } = req.body;

    console.log('Tentativa de login:', { email, senha }); // Debug

    // Validação simples para demonstração
    if (email === 'admin@pcrlabor.com' && senha === 'admin123') {
      console.log('Login bem-sucedido, redirecionando para dashboard'); // Debug
      return res.redirect('/dashboard');
    } else {
      console.log('Credenciais inválidas'); // Debug
      return res.render('pages/login', {
        pageTitle: 'Login - PCR Labor',
        currentPage: 'login',
        error: 'Email ou senha inválidos'
      });
    }
  } catch (error) {
    console.error('Erro no processLogin:', error); // Debug
    return res.status(500).render('pages/login', {
      pageTitle: 'Login - PCR Labor',
      currentPage: 'login',
      error: 'Erro interno do servidor'
    });
  }
};

const syncData = async (req, res) => {
  try {
    console.log('🔄 Sincronização manual iniciada...');

    const result = await ServicoIntegracaoDados.syncPlatformData();

    if (result.success) {
      res.json({
        success: true,
        message: 'Dados sincronizados com sucesso',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getMetrics = async (req, res) => {
  try {
    console.log('📊 Buscando estatísticas do dashboard...');
    const id_empresa = req.id_empresa; // Vem do middleware de autenticação
    console.log('🏢 Filtrando métricas para empresa ID:', id_empresa);

    const metrics = await ServicoIntegracaoDados.calculateMetrics(id_empresa);

    console.log('✅ Estatísticas calculadas:', metrics);

    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  renderDashboard,
  renderLogin,
  processLogin,
  syncData,
  getMetrics
};
