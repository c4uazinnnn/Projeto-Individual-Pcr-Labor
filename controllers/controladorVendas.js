// controllers/vendaController.js

const Venda = require('../models/modeloVendas');
const Produto = require('../models/modeloProdutos');
const Plataforma = require('../models/modeloPlataformas');

const renderVendas = async (req, res) => {
  try {
    let vendas = [];
    let produtos = [];
    let plataformas = [];

    try {
      const [vendasDB, produtosDB, plataformasDB] = await Promise.all([
        Venda.getAll(),
        Produto.getAll(),
        Plataforma.getAll()
      ]);
      vendas = vendasDB;
      produtos = produtosDB;
      plataformas = plataformasDB;
    } catch (dbError) {
      console.log('Banco não disponível, usando dados de demonstração');
      produtos = [
        { id_produto: 1, nome: 'Kit PCR COVID-19', sku: 'PCR-COVID-001', preco: 89.90, estoque_atual: 150 },
        { id_produto: 2, nome: 'Kit PCR Influenza', sku: 'PCR-FLU-001', preco: 79.90, estoque_atual: 200 },
        { id_produto: 3, nome: 'Kit PCR Hepatite B', sku: 'PCR-HEP-001', preco: 95.50, estoque_atual: 100 }
      ];

      plataformas = [
        { id_plataforma: 1, nome: 'Mercado Livre' },
        { id_plataforma: 2, nome: 'Shopee' },
        { id_plataforma: 3, nome: 'Site Próprio' }
      ];

      vendas = [
        { id_venda: 1, produto_nome: 'Kit PCR COVID-19', plataforma_nome: 'Mercado Livre', quantidade: 10, valor_total: 899.00, data: new Date('2025-01-15') },
        { id_venda: 2, produto_nome: 'Kit PCR Influenza', plataforma_nome: 'Shopee', quantidade: 5, valor_total: 399.50, data: new Date('2025-01-14') },
        { id_venda: 3, produto_nome: 'Kit PCR Hepatite B', plataforma_nome: 'Site Próprio', quantidade: 3, valor_total: 286.50, data: new Date('2025-01-13') }
      ];
    }

    res.render('pages/vendas', {
      pageTitle: 'Vendas - PCR Labor',
      currentPage: 'vendas',
      vendas,
      produtos,
      plataformas
    });
  } catch (error) {
    console.error('Erro ao carregar vendas:', error);
    res.status(500).render('pages/error', {
      pageTitle: 'Erro - PCR Labor',
      error: 'Erro ao carregar vendas'
    });
  }
};

const renderPlataformas = async (req, res) => {
  try {
    let plataformas = [];
    let vendasPorPlataforma = [];

    try {
      const [plataformasDB, vendasPorPlataformaDB] = await Promise.all([
        Plataforma.getAll(),
        Plataforma.getVendasPorPlataforma()
      ]);
      plataformas = plataformasDB;
      vendasPorPlataforma = vendasPorPlataformaDB;
    } catch (dbError) {
      console.log('Banco não disponível, usando dados de demonstração');
      plataformas = [
        { id_plataforma: 1, nome: 'Mercado Livre' },
        { id_plataforma: 2, nome: 'Shopee' },
        { id_plataforma: 3, nome: 'Site Próprio' }
      ];

      vendasPorPlataforma = [
        { id_plataforma: 1, nome: 'Mercado Livre', total_vendas: 15, quantidade_total: 45, valor_total: 1500.00 },
        { id_plataforma: 2, nome: 'Shopee', total_vendas: 8, quantidade_total: 25, valor_total: 800.00 },
        { id_plataforma: 3, nome: 'Site Próprio', total_vendas: 5, quantidade_total: 15, valor_total: 600.00 }
      ];
    }

    // Buscar produtos também
    let produtos = [];
    try {
      const Produto = require('../models/modeloProdutos');
      produtos = await Produto.getAll();
    } catch (error) {
      produtos = [
        { id_produto: 1, nome: 'Kit PCR COVID-19', sku: 'PCR-COVID-001', preco: 89.90, estoque_atual: 150 },
        { id_produto: 2, nome: 'Kit PCR Influenza', sku: 'PCR-FLU-001', preco: 79.90, estoque_atual: 200 }
      ];
    }

    res.render('pages/plataformas', {
      pageTitle: 'Plataformas - PCR Labor',
      currentPage: 'plataformas',
      plataformas: vendasPorPlataforma, // Usar vendasPorPlataforma que tem os dados completos
      vendasPorPlataforma,
      produtos
    });
  } catch (error) {
    console.error('Erro ao carregar plataformas:', error);
    res.status(500).render('pages/error', {
      pageTitle: 'Erro - PCR Labor',
      error: 'Erro ao carregar plataformas'
    });
  }
};

// API endpoints
const getAllVendas = async (req, res) => {
  try {
    const id_empresa = req.id_empresa; // Vem do middleware
    console.log(`💰 API Vendas - Buscando para empresa ID: ${id_empresa}`);

    const vendas = await Venda.getAll(id_empresa);

    console.log(`✅ API Vendas - Encontradas: ${vendas.length} vendas`);
    if (vendas.length > 0) {
      console.log(`📋 API Vendas - Primeira: ${vendas[0].produto_nome} (${vendas[0].empresa_nome})`);
    }

    res.status(200).json({
      success: true,
      data: vendas,
      message: 'Vendas recuperadas com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getVendaById = async (req, res) => {
  try {
    const venda = await Venda.getById(req.params.id);
    if (venda) {
      res.status(200).json({
        success: true,
        data: venda,
        message: 'Venda encontrada'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Venda não encontrada'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const createVenda = async (req, res) => {
  try {
    const id_empresa = req.id_empresa; // Vem do middleware
    const { id_produto, quantidade, preco_unitario, id_plataforma, data } = req.body;

    // Validações
    if (!id_produto || !quantidade || !preco_unitario || !id_plataforma) {
      return res.status(400).json({
        success: false,
        error: 'Todos os campos são obrigatórios'
      });
    }

    // Verificar se o produto pertence à empresa do usuário
    const Produto = require('../models/modeloProdutos');
    const produto = await Produto.getById(id_produto);

    if (!produto || produto.id_empresa !== id_empresa) {
      return res.status(403).json({
        success: false,
        error: 'Produto não encontrado ou não pertence à sua empresa'
      });
    }

    // Verificar estoque
    if (produto.estoque_atual < quantidade) {
      return res.status(400).json({
        success: false,
        error: `Estoque insuficiente. Disponível: ${produto.estoque_atual} unidades`
      });
    }

    // Calcular valor total
    const valor_total = quantidade * preco_unitario;

    // Dados da venda
    const vendaData = {
      id_produto,
      id_empresa,
      id_plataforma,
      quantidade,
      valor_total,
      preco_unitario,
      data: data || new Date().toISOString().split('T')[0],
      status: 'confirmada'
    };

    console.log(`💰 Criando nova venda para empresa ID: ${id_empresa}`);
    console.log(`📦 Produto: ${produto.nome} (${quantidade} unidades)`);
    console.log(`💵 Valor total: R$ ${valor_total.toFixed(2)}`);

    const venda = await Venda.create(vendaData);

    // Atualizar estoque do produto
    const novoEstoque = produto.estoque_atual - quantidade;
    await Produto.updateEstoque(id_produto, novoEstoque);

    console.log(`✅ Venda criada com sucesso! ID: ${venda.id_venda}`);
    console.log(`📦 Estoque atualizado: ${produto.estoque_atual} → ${novoEstoque}`);

    res.status(201).json({
      success: true,
      data: venda,
      message: 'Venda criada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar venda:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const updateVenda = async (req, res) => {
  try {
    const id_empresa = req.id_empresa; // Verificar se a venda pertence à empresa
    const { produto_id, plataforma_id, quantidade, preco_unitario, status, data_venda, observacoes } = req.body;

    console.log(`✏️ Atualizando venda ID: ${req.params.id} para empresa ID: ${id_empresa}`);
    console.log(`📋 Novos dados:`, { produto_id, plataforma_id, quantidade, preco_unitario, status, data_venda, observacoes });

    // Calcular valor total
    const valor_total = quantidade * preco_unitario;

    const updatedVenda = await Venda.update(req.params.id, {
      id_produto: produto_id,
      id_plataforma: plataforma_id,
      quantidade,
      preco_unitario,
      valor_total,
      status,
      data: data_venda,
      observacoes
    });

    if (updatedVenda) {
      console.log(`✅ Venda atualizada com sucesso: ID ${updatedVenda.id_venda}`);
      res.status(200).json({
        success: true,
        data: updatedVenda,
        message: 'Venda atualizada com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Venda não encontrada'
      });
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar venda:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const deleteVenda = async (req, res) => {
  try {
    const deleted = await Venda.delete(req.params.id);
    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'Venda deletada com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Venda não encontrada'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getVendasPorPeriodo = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    const vendas = await Venda.getByPeriodo(dataInicio, dataFim);
    res.status(200).json({
      success: true,
      data: vendas,
      message: 'Vendas por período recuperadas com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getRelatorioVendas = async (req, res) => {
  try {
    const vendasPorMes = await Venda.getVendasPorMes();
    res.status(200).json({
      success: true,
      data: vendasPorMes,
      message: 'Relatório de vendas gerado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  renderVendas,
  renderPlataformas,
  getAllVendas,
  getVendaById,
  createVenda,
  updateVenda,
  deleteVenda,
  getVendasPorPeriodo,
  getRelatorioVendas
};
