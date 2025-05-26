// controllers/pedidoController.js

const Pedido = require('../models/modeloPedidos');
const Produto = require('../models/modeloProdutos');
const Plataforma = require('../models/modeloPlataformas');

// Renderizar página de pedidos
const renderPedidos = async (req, res) => {
  try {
    console.log('🔄 Carregando página de pedidos...');

    let pedidos = [];
    let produtos = [];
    let plataformas = [];
    let projecaoCompras = [];
    let pedidosPorStatus = [];

    try {
      // Buscar dados do banco
      [pedidos, produtos, plataformas, projecaoCompras, pedidosPorStatus] = await Promise.all([
        Pedido.getAll(),
        Produto.getAll(),
        Plataforma.getAll(),
        Pedido.getProjecaoCompras(),
        Pedido.getPedidosPorStatus()
      ]);

      console.log('✅ Dados de pedidos carregados do banco');
    } catch (dbError) {
      console.log('⚠️ Banco não disponível, usando dados de demonstração:', dbError.message);

      // Dados de demonstração
      pedidos = [
        {
          id_pedido: 1,
          produto_nome: 'Kit PCR COVID-19',
          plataforma_nome: 'Fornecedor A',
          quantidade: 100,
          status: 'pendente',
          data_pedido: new Date().toISOString().split('T')[0],
          valor_total: 5000.00
        },
        {
          id_pedido: 2,
          produto_nome: 'Kit PCR Influenza',
          plataforma_nome: 'Fornecedor B',
          quantidade: 50,
          status: 'aprovado',
          data_pedido: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          valor_total: 2500.00
        },
        {
          id_pedido: 3,
          produto_nome: 'Kit PCR Hepatite B',
          plataforma_nome: 'Fornecedor A',
          quantidade: 75,
          status: 'entregue',
          data_pedido: new Date(Date.now() - 172800000).toISOString().split('T')[0],
          valor_total: 3750.00
        }
      ];

      produtos = [
        { id_produto: 1, nome: 'Kit PCR COVID-19', sku: 'PCR-COVID-001', preco: 89.90, estoque_atual: 5 },
        { id_produto: 2, nome: 'Kit PCR Influenza', sku: 'PCR-FLU-001', preco: 79.90, estoque_atual: 8 },
        { id_produto: 3, nome: 'Kit PCR Hepatite B', sku: 'PCR-HEP-001', preco: 95.50, estoque_atual: 12 }
      ];

      projecaoCompras = [
        {
          produto_nome: 'Kit PCR COVID-19',
          sku: 'PCR-COVID-001',
          estoque_atual: 5,
          media_pedidos: 15,
          total_pedidos: 45,
          prioridade: 'URGENTE'
        },
        {
          produto_nome: 'Kit PCR Influenza',
          sku: 'PCR-FLU-001',
          estoque_atual: 8,
          media_pedidos: 12,
          total_pedidos: 36,
          prioridade: 'URGENTE'
        }
      ];

      pedidosPorStatus = [
        { status: 'pendente', total_pedidos: 5, valor_total: 12500.00, quantidade_total: 250 },
        { status: 'aprovado', total_pedidos: 3, valor_total: 7500.00, quantidade_total: 150 },
        { status: 'entregue', total_pedidos: 8, valor_total: 20000.00, quantidade_total: 400 }
      ];
    }

    // Calcular estatísticas
    const stats = {
      totalPedidos: pedidos.length,
      pedidosPendentes: pedidos.filter(p => p.status === 'pendente').length,
      pedidosAprovados: pedidos.filter(p => p.status === 'aprovado').length,
      valorTotalPedidos: pedidos.reduce((total, p) => total + parseFloat(p.valor_total || 0), 0),
      produtosUrgentes: projecaoCompras.filter(p => p.prioridade === 'URGENTE').length
    };

    res.render('pages/pedidos', {
      pageTitle: 'Pedidos - PCR Labor',
      currentPage: 'pedidos',
      pedidos,
      produtos,
      plataformas,
      projecaoCompras,
      pedidosPorStatus,
      stats
    });
  } catch (error) {
    console.error('❌ Erro ao carregar pedidos:', error);
    res.status(500).render('pages/error', {
      pageTitle: 'Erro - PCR Labor',
      error: 'Erro ao carregar pedidos'
    });
  }
};

// API endpoints
const getAllPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.getAll();
    res.status(200).json({
      success: true,
      data: pedidos,
      message: 'Pedidos recuperados com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getPedidoById = async (req, res) => {
  try {
    const pedido = await Pedido.getById(req.params.id);
    if (pedido) {
      res.status(200).json({
        success: true,
        data: pedido,
        message: 'Pedido encontrado'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Pedido não encontrado'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const createPedido = async (req, res) => {
  try {
    const { id_produto, id_plataforma, quantidade, status, data_pedido, valor_total } = req.body;
    const newPedido = await Pedido.create({ id_produto, id_plataforma, quantidade, status, data_pedido, valor_total });
    res.status(201).json({
      success: true,
      data: newPedido,
      message: 'Pedido criado com sucesso'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const updatePedido = async (req, res) => {
  try {
    const { id_produto, id_plataforma, quantidade, status, data_pedido, valor_total } = req.body;
    const updatedPedido = await Pedido.update(req.params.id, { id_produto, id_plataforma, quantidade, status, data_pedido, valor_total });
    if (updatedPedido) {
      res.status(200).json({
        success: true,
        data: updatedPedido,
        message: 'Pedido atualizado com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Pedido não encontrado'
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const deletePedido = async (req, res) => {
  try {
    const deleted = await Pedido.delete(req.params.id);
    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'Pedido deletado com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Pedido não encontrado'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getPedidosPorStatus = async (req, res) => {
  try {
    const pedidos = await Pedido.getPedidosPorStatus();
    res.status(200).json({
      success: true,
      data: pedidos,
      message: 'Pedidos por status recuperados com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getProjecaoCompras = async (req, res) => {
  try {
    const projecao = await Pedido.getProjecaoCompras();
    res.status(200).json({
      success: true,
      data: projecao,
      message: 'Projeção de compras gerada com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getRelatorioPedidos = async (req, res) => {
  try {
    const pedidosPorMes = await Pedido.getPedidosPorMes();
    res.status(200).json({
      success: true,
      data: pedidosPorMes,
      message: 'Relatório de pedidos gerado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  renderPedidos,
  getAllPedidos,
  getPedidoById,
  createPedido,
  updatePedido,
  deletePedido,
  getPedidosPorStatus,
  getProjecaoCompras,
  getRelatorioPedidos
};
