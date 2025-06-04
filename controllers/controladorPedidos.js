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
    const id_empresa = req.id_empresa; // Vem do middleware
    const usuario = req.usuario; // Vem do middleware

    try {
      // Buscar dados do banco FILTRADOS POR EMPRESA
      [pedidos, produtos, plataformas, projecaoCompras, pedidosPorStatus] = await Promise.all([
        Pedido.getAll(id_empresa), // FILTRADO POR EMPRESA
        Produto.getAll(id_empresa), // FILTRADO POR EMPRESA
        Plataforma.getAll(),
        Pedido.getProjecaoCompras(id_empresa), // FILTRADO POR EMPRESA
        Pedido.getPedidosPorStatus(id_empresa) // FILTRADO POR EMPRESA
      ]);

      console.log(`🛒 Página Pedidos - Carregados ${pedidos.length} pedidos para empresa ${usuario.empresa_nome}`);

      console.log('✅ Dados de pedidos carregados do banco');
    } catch (dbError) {
      console.error('❌ Erro ao carregar dados do banco:', dbError.message);

      // Em caso de erro, usar arrays vazios em vez de dados de demonstração
      pedidos = [];
      produtos = [];
      plataformas = [];
      projecaoCompras = [];
      pedidosPorStatus = [];

      console.log('⚠️ Usando dados vazios devido ao erro no banco');
    }

    // Calcular estatísticas
    const stats = {
      totalPedidos: pedidos.length,
      pedidosPendentes: pedidos.filter(p => p.status === 'PENDENTE').length,
      pedidosAprovados: pedidos.filter(p => p.status === 'APROVADO').length,
      valorTotalPedidos: pedidos.reduce((total, p) => total + parseFloat(p.valor_total || 0), 0),
      produtosUrgentes: projecaoCompras.filter(p => p.prioridade === 'URGENTE').length
    };

    res.render('pages/pedidos', {
      pageTitle: `Pedidos - ${usuario.empresa_nome}`,
      currentPage: 'pedidos',
      pedidos,
      produtos,
      plataformas,
      projecaoCompras,
      pedidosPorStatus,
      stats,
      usuario
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
    const id_empresa = req.id_empresa; // Filtro por empresa
    const pedidos = await Pedido.getAll(id_empresa);
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
    console.log('📥 Dados recebidos para criar pedido:', req.body);

    const {
      id_produto,
      id_plataforma,
      quantidade,
      status,
      data_pedido,
      valor_total,
      fornecedor,
      prioridade,
      data_entrega,
      observacoes
    } = req.body;

    // Validação básica
    if (!id_produto || !quantidade || !valor_total) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: id_produto, quantidade, valor_total'
      });
    }

    const pedidoData = {
      id_produto: parseInt(id_produto),
      id_plataforma: id_plataforma || 1,
      quantidade: parseInt(quantidade),
      status: status || 'PENDENTE',
      data_pedido: data_pedido || new Date().toISOString().split('T')[0],
      valor_total: parseFloat(valor_total),
      fornecedor: fornecedor || 'PCR Labor',
      prioridade: prioridade || 'media',
      data_entrega: data_entrega,
      observacoes: observacoes
    };

    console.log('📤 Dados processados para o banco:', pedidoData);

    const newPedido = await Pedido.create(pedidoData);

    console.log('✅ Pedido criado com sucesso:', newPedido);

    res.status(201).json({
      success: true,
      data: newPedido,
      message: 'Pedido criado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar pedido:', error);
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
