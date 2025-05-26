// controllers/dashboardController.js

const Produto = require('../models/modeloProdutos');
const Venda = require('../models/modeloVendas');
const Plataforma = require('../models/modeloPlataformas');
const ServicoIntegracaoDados = require('../services/servicoIntegracaoDados');

const renderDashboard = async (req, res) => {
  try {
    console.log('🔄 Carregando dashboard com dados em tempo real...');

    // Sistema simplificado - usuário admin único
    console.log('👤 Dashboard para: Admin PCR Labor');

    // Buscar TODOS os dados sem filtro de empresa
    console.log('📦 Buscando todos os produtos');
    console.log('💰 Buscando todas as vendas');
    const [produtos, vendas] = await Promise.all([
      Produto.getAll(),
      Venda.getAll()
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

    const stats = {
      totalProdutos,
      produtosEstoqueBaixo,
      totalVendas,
      vendasHoje,
      valorTotalVendas,
      ticketMedio,
      produtoMaisVendido
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
      pageTitle: 'Dashboard - PCR Labor',
      currentPage: 'dashboard',
      stats,
      produtos: produtos.slice(0, 5),
      vendas: vendas.slice(0, 10),
      lastUpdate: new Date().toLocaleString('pt-BR')
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
        Plataforma.getVendasPorPlataforma()
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
    const metrics = await ServicoIntegracaoDados.calculateMetrics();
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
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
