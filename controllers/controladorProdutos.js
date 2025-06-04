// controllers/produtoController.js

const Produto = require('../models/modeloProdutos');
const ServicoImportacaoExcel = require('../services/servicoImportacaoExcel');
const fs = require('fs');

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
    let pedidos = [];
    let vendas = [];
    const id_empresa = req.id_empresa; // Vem do middleware
    const usuario = req.usuario; // Vem do middleware

    try {
      // Buscar TODOS os dados necessários para os gráficos
      const Venda = require('../models/modeloVendas');
      const Pedido = require('../models/modeloPedidos');

      const [produtosDB, produtosEstoqueBaixoDB, pedidosDB, vendasDB] = await Promise.all([
        Produto.getAll(id_empresa),
        Produto.getEstoqueBaixo(10, id_empresa),
        Pedido.getAll(id_empresa).catch(() => []),
        Venda.getAll(id_empresa).catch(() => [])
      ]);

      produtos = produtosDB;
      produtosEstoqueBaixo = produtosEstoqueBaixoDB;
      pedidos = pedidosDB;
      vendas = vendasDB;

      console.log(`📦 Página Estoque - Carregados ${produtos.length} produtos para empresa ${usuario.empresa_nome}`);
      console.log(`📋 Página Estoque - Carregados ${pedidos.length} pedidos para gráficos`);
      console.log(`💰 Página Estoque - Carregadas ${vendas.length} vendas para gráficos`);
    } catch (dbError) {
      console.log('Banco não disponível, usando dados vazios:', dbError.message);
      produtos = [];
      produtosEstoqueBaixo = [];
      pedidos = [];
      vendas = [];
    }

    res.render('pages/estoque', {
      pageTitle: `Estoque - ${usuario.empresa_nome}`,
      currentPage: 'estoque',
      produtos,
      produtosEstoqueBaixo,
      pedidos, // DADOS PARA GRÁFICO DE COMPRAS
      vendas,  // DADOS PARA GRÁFICO DE ENVIOS
      usuario
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
    const {
      nome,
      sku,
      preco,
      preco_base,
      custo_frete,
      estoque_atual,
      estoque_minimo,
      categoria,
      descricao
    } = req.body;

    console.log(`📦 Criando produto para empresa ID: ${id_empresa}`);
    console.log(`📋 Dados do produto:`, { nome, sku, preco, preco_base, custo_frete, estoque_atual });

    // Validações
    if (!nome || !sku || !preco || estoque_atual === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Nome, SKU, preço e estoque são obrigatórios'
      });
    }

    // Verificar se SKU já existe na empresa
    const produtos = await Produto.getAll(id_empresa);
    const skuExistente = produtos.find(p => p.sku === sku);
    if (skuExistente) {
      return res.status(400).json({
        success: false,
        error: 'SKU já existe nesta empresa'
      });
    }

    const newProduto = await Produto.create({
      id_empresa,
      nome,
      sku,
      preco: parseFloat(preco),
      preco_base: parseFloat(preco_base || 0),
      custo_frete: parseFloat(custo_frete || 0),
      estoque_atual: parseInt(estoque_atual),
      estoque_minimo: parseInt(estoque_minimo || 10),
      categoria: categoria || 'Geral',
      descricao: descricao || ''
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

// Importar produtos via Excel
const importarProdutosExcel = async (req, res) => {
  try {
    const id_empresa = req.id_empresa;

    console.log('📥 Iniciando importação de produtos via Excel');

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo foi enviado'
      });
    }

    console.log('📄 Arquivo recebido:', req.file.filename);

    // Validar estrutura do arquivo
    try {
      const validacao = ServicoImportacaoExcel.validarEstrutura(req.file.path);
      console.log('✅ Arquivo válido:', validacao);
    } catch (validationError) {
      // Remover arquivo inválido
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        error: validationError.message
      });
    }

    // Processar arquivo
    const resultado = await ServicoImportacaoExcel.processarArquivo(req.file.path, id_empresa);

    // Remover arquivo após processamento
    fs.unlinkSync(req.file.path);

    console.log('✅ Importação concluída:', resultado);

    res.status(200).json({
      success: true,
      data: resultado,
      message: `Importação concluída: ${resultado.sucessos} produtos importados, ${resultado.erros} erros`
    });

  } catch (error) {
    console.error('❌ Erro na importação:', error);

    // Remover arquivo em caso de erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Baixar template Excel
const baixarTemplateExcel = async (req, res) => {
  try {
    console.log('📄 Gerando template Excel para download');

    const buffer = ServicoImportacaoExcel.gerarTemplateExcel();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=template-produtos.xlsx');

    res.send(buffer);

  } catch (error) {
    console.error('❌ Erro ao gerar template:', error);
    res.status(500).json({
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
  updateEstoque,
  importarProdutosExcel,
  baixarTemplateExcel
};
