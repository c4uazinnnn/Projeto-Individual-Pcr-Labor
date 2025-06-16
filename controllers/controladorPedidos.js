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
      console.log('📊 Primeiros 3 pedidos:', pedidos.slice(0, 3).map(p => ({ id: p.id_pedido, produto: p.produto_nome, valor: p.valor_total })));

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
    const valorTotalCalculado = pedidos.reduce((total, p) => {
      return total + parseFloat(p.valor_total || 0);
    }, 0);

    const stats = {
      totalPedidos: pedidos.length,
      pedidosPendentes: pedidos.filter(p => p.status === 'PENDENTE').length,
      pedidosAprovados: pedidos.filter(p => p.status === 'APROVADO').length,
      valorTotalPedidos: valorTotalCalculado,
      produtosUrgentes: projecaoCompras.filter(p => p.prioridade === 'URGENTE').length
    };

    console.log('🎯 RENDERIZANDO PÁGINA COM DADOS:');
    console.log(`   - Pedidos: ${pedidos.length}`);
    console.log(`   - Produtos: ${produtos.length}`);
    console.log(`   - Stats: ${JSON.stringify(stats)}`);

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
    console.log('🏢 ID da empresa:', req.id_empresa);

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
      fornecedor: fornecedor || 'PCR Labor'
    };

    console.log('📤 Dados processados para o banco:', pedidoData);

    const newPedido = await Pedido.create(pedidoData);

    console.log('✅ Pedido criado com sucesso:', newPedido);

    // NOTA: Estoque será atualizado apenas quando o pedido for marcado como ENTREGUE

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
    console.log(`📝 Atualizando pedido ${req.params.id}...`);
    console.log('📥 Dados recebidos:', req.body);

    const {
      id_produto,
      id_plataforma,
      quantidade,
      status,
      data_pedido,
      valor_total,
      fornecedor
    } = req.body;

    // Validar dados obrigatórios
    if (!id_produto || !quantidade || !valor_total) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: id_produto, quantidade, valor_total'
      });
    }

    const dadosAtualizacao = {
      id_produto: parseInt(id_produto),
      id_plataforma: id_plataforma || 1,
      quantidade: parseInt(quantidade),
      status: status || 'PENDENTE',
      data_pedido: data_pedido,
      valor_total: parseFloat(valor_total),
      fornecedor: fornecedor || 'PCR Labor'
    };

    console.log('📤 Dados para atualização:', dadosAtualizacao);

    // Buscar pedido atual para comparar status
    console.log(`🔍 Buscando pedido atual com ID: ${req.params.id}`);
    const pedidoAtual = await Pedido.getById(req.params.id);
    console.log(`📋 Pedido atual encontrado:`, pedidoAtual);

    console.log(`🔄 Atualizando pedido com dados:`, dadosAtualizacao);
    const updatedPedido = await Pedido.update(req.params.id, dadosAtualizacao);
    console.log(`✅ Pedido atualizado:`, updatedPedido);

    if (updatedPedido) {
      console.log('✅ Pedido atualizado com sucesso:', updatedPedido);

      // Verificar se o status mudou para ENTREGUE (RECEBIDO)
      if (pedidoAtual && pedidoAtual.status !== 'ENTREGUE' && status === 'ENTREGUE') {
        console.log('📦 PEDIDO MARCADO COMO RECEBIDO - Iniciando atualização de estoque...');
        console.log(`📋 Pedido: #${updatedPedido.id_pedido}`);
        console.log(`📦 Produto ID: ${updatedPedido.id_produto}`);
        console.log(`📊 Quantidade a adicionar: ${updatedPedido.quantidade}`);

        try {
          const Produto = require('../models/modeloProdutos');

          // Buscar produto atual
          console.log(`🔍 Buscando produto com ID: ${updatedPedido.id_produto}`);
          const produto = await Produto.getById(updatedPedido.id_produto);

          if (produto) {
            const estoqueAnterior = parseInt(produto.estoque_atual || 0);
            const quantidadeAdicionar = parseInt(updatedPedido.quantidade);
            const novoEstoque = estoqueAnterior + quantidadeAdicionar;

            console.log(`📊 DADOS PARA ATUALIZAÇÃO DE ESTOQUE:`);
            console.log(`   - Produto: ${produto.nome} (SKU: ${produto.sku})`);
            console.log(`   - ID Produto: ${produto.id_produto}`);
            console.log(`   - Estoque anterior: ${estoqueAnterior}`);
            console.log(`   - Quantidade a adicionar: +${quantidadeAdicionar}`);
            console.log(`   - Novo estoque calculado: ${novoEstoque}`);

            // Usar a função específica updateEstoque
            console.log(`🔄 Executando updateEstoque(${updatedPedido.id_produto}, ${novoEstoque})...`);
            const produtoAtualizado = await Produto.updateEstoque(updatedPedido.id_produto, novoEstoque);

            if (produtoAtualizado) {
              console.log(`✅ ESTOQUE ATUALIZADO COM SUCESSO!`);
              console.log(`📈 ${produto.nome}: ${estoqueAnterior} → ${produtoAtualizado.estoque_atual} (+${quantidadeAdicionar})`);
              console.log(`🎯 Produto atualizado:`, produtoAtualizado);
            } else {
              console.error('❌ updateEstoque retornou null/undefined');
            }
          } else {
            console.error(`❌ Produto com ID ${updatedPedido.id_produto} não encontrado`);
          }
        } catch (estoqueError) {
          console.error('❌ ERRO AO ATUALIZAR ESTOQUE:', estoqueError.message);
          console.error('📋 Stack trace:', estoqueError.stack);
        }
      } else {
        console.log(`ℹ️ Status não mudou para ENTREGUE:`);
        console.log(`   - Status anterior: ${pedidoAtual ? pedidoAtual.status : 'N/A'}`);
        console.log(`   - Status novo: ${status}`);
        console.log(`   - Condição atendida: ${pedidoAtual && pedidoAtual.status !== 'ENTREGUE' && status === 'ENTREGUE'}`);
      }

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
    console.error('❌ Erro ao atualizar pedido:', error);
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
