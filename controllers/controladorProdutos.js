// controllers/produtoController.js

const Produto = require('../models/modeloProdutos');

const renderProdutos = async (req, res) => {
  try {
    let produtos = [];
    const id_empresa = req.id_empresa; // Vem do middleware
    const usuario = req.usuario; // Vem do middleware

    try {
      produtos = await Produto.getAll(id_empresa);
      console.log(`📦 Página Produtos - Carregados ${produtos.length} produtos para empresa ${usuario.empresa_nome}`);
    } catch (dbError) {
      console.log('Banco não disponível, usando dados de demonstração');
      produtos = [
        { id_produto: 1, nome: 'Kit PCR COVID-19', sku: 'PCR-COVID-001', preco: 89.90, estoque_atual: 150 },
        { id_produto: 2, nome: 'Kit PCR Influenza', sku: 'PCR-FLU-001', preco: 79.90, estoque_atual: 200 },
        { id_produto: 3, nome: 'Kit PCR Hepatite B', sku: 'PCR-HEP-001', preco: 95.50, estoque_atual: 100 },
        { id_produto: 4, nome: 'Kit PCR Dengue', sku: 'PCR-DEN-001', preco: 85.00, estoque_atual: 5 },
        { id_produto: 5, nome: 'Kit PCR Zika', sku: 'PCR-ZIK-001', preco: 92.50, estoque_atual: 75 }
      ];
    }

    res.render('pages/produtos', {
      pageTitle: `Produtos - ${usuario.empresa_nome}`,
      currentPage: 'produtos',
      produtos,
      usuario
    });
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    res.status(500).render('pages/error', {
      pageTitle: 'Erro - PCR Labor',
      error: 'Erro ao carregar produtos'
    });
  }
};

const renderEstoque = async (req, res) => {
  try {
    let produtos = [];
    let produtosEstoqueBaixo = [];

    try {
      const [produtosDB, produtosEstoqueBaixoDB] = await Promise.all([
        Produto.getAll(),
        Produto.getEstoqueBaixo(10)
      ]);
      produtos = produtosDB;
      produtosEstoqueBaixo = produtosEstoqueBaixoDB;
    } catch (dbError) {
      console.log('Banco não disponível, usando dados de demonstração');
      produtos = [
        { id_produto: 1, nome: 'Kit PCR COVID-19', sku: 'PCR-COVID-001', preco: 89.90, estoque_atual: 150 },
        { id_produto: 2, nome: 'Kit PCR Influenza', sku: 'PCR-FLU-001', preco: 79.90, estoque_atual: 200 },
        { id_produto: 3, nome: 'Kit PCR Hepatite B', sku: 'PCR-HEP-001', preco: 95.50, estoque_atual: 100 },
        { id_produto: 4, nome: 'Kit PCR Dengue', sku: 'PCR-DEN-001', preco: 85.00, estoque_atual: 5 },
        { id_produto: 5, nome: 'Kit PCR Zika', sku: 'PCR-ZIK-001', preco: 92.50, estoque_atual: 75 }
      ];
      produtosEstoqueBaixo = produtos.filter(p => p.estoque_atual <= 10);
    }

    res.render('pages/estoque', {
      pageTitle: 'Estoque - PCR Labor',
      currentPage: 'estoque',
      produtos,
      produtosEstoqueBaixo
    });
  } catch (error) {
    console.error('Erro ao carregar estoque:', error);
    res.status(500).render('pages/error', {
      pageTitle: 'Erro - PCR Labor',
      error: 'Erro ao carregar estoque'
    });
  }
};

// API endpoints
const getAllProdutos = async (req, res) => {
  try {
    const id_empresa = req.id_empresa; // Vem do middleware
    console.log(`📦 API Produtos - Buscando para empresa ID: ${id_empresa}`);

    const produtos = await Produto.getAll(id_empresa);

    console.log(`✅ API Produtos - Encontrados: ${produtos.length} produtos`);
    if (produtos.length > 0) {
      console.log(`📋 API Produtos - Primeiro: ${produtos[0].nome} (${produtos[0].empresa_nome})`);
    }

    res.status(200).json({
      success: true,
      data: produtos,
      message: 'Produtos recuperados com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getProdutoById = async (req, res) => {
  try {
    const produto = await Produto.getById(req.params.id);
    if (produto) {
      res.status(200).json({
        success: true,
        data: produto,
        message: 'Produto encontrado'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const createProduto = async (req, res) => {
  try {
    const id_empresa = req.id_empresa; // Pegar do middleware
    const { nome, sku, preco, estoque_atual, estoque_minimo } = req.body;

    console.log(`📦 Criando produto para empresa ID: ${id_empresa}`);
    console.log(`📋 Dados do produto:`, { nome, sku, preco, estoque_atual, estoque_minimo });

    const newProduto = await Produto.create({
      id_empresa,
      nome,
      sku,
      preco,
      estoque_atual,
      estoque_minimo: estoque_minimo || 10
    });

    console.log(`✅ Produto criado com sucesso: ${newProduto.nome}`);

    res.status(201).json({
      success: true,
      data: newProduto,
      message: 'Produto criado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar produto:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const updateProduto = async (req, res) => {
  try {
    const id_empresa = req.id_empresa; // Verificar se o produto pertence à empresa
    const { nome, sku, preco, estoque_atual, estoque_minimo } = req.body;

    console.log(`✏️ Atualizando produto ID: ${req.params.id} para empresa ID: ${id_empresa}`);
    console.log(`📋 Novos dados:`, { nome, sku, preco, estoque_atual, estoque_minimo });

    const updatedProduto = await Produto.update(req.params.id, {
      nome,
      sku,
      preco,
      estoque_atual,
      estoque_minimo
    });

    if (updatedProduto) {
      console.log(`✅ Produto atualizado com sucesso: ${updatedProduto.nome}`);
      res.status(200).json({
        success: true,
        data: updatedProduto,
        message: 'Produto atualizado com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar produto:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const deleteProduto = async (req, res) => {
  try {
    const deleted = await Produto.delete(req.params.id);
    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'Produto deletado com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const updateEstoque = async (req, res) => {
  try {
    const { estoque_atual } = req.body;
    const updatedProduto = await Produto.updateEstoque(req.params.id, estoque_atual);
    if (updatedProduto) {
      res.status(200).json({
        success: true,
        data: updatedProduto,
        message: 'Estoque atualizado com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  renderProdutos,
  renderEstoque,
  getAllProdutos,
  getProdutoById,
  createProduto,
  updateProduto,
  deleteProduto,
  updateEstoque
};
