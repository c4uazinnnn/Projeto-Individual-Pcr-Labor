// routes/produtoRoutes.js

const express = require('express');
const router = express.Router();
const { verificarAutenticacaoAPI } = require('../middleware/autenticacao');
const controladorProdutos = require('../controllers/controladorProdutos');
const ServicoImportacaoExcel = require('../services/servicoImportacaoExcel');

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarAutenticacaoAPI);

// GET /api/produtos - Buscar todos os produtos
router.get('/', controladorProdutos.getAllProdutos);

// GET /api/produtos/:id - Buscar produto por ID
router.get('/:id', controladorProdutos.getProdutoById);

// POST /api/produtos - Criar novo produto
router.post('/', controladorProdutos.createProduto);

// PUT /api/produtos/:id - Atualizar produto
router.put('/:id', controladorProdutos.updateProduto);

// PATCH /api/produtos/:id/estoque - Atualizar apenas estoque
router.patch('/:id/estoque', controladorProdutos.updateEstoque);

// DELETE /api/produtos/:id - Deletar produto
router.delete('/:id', controladorProdutos.deleteProduto);

// POST /api/produtos/importar - Importar produtos via Excel
router.post('/importar', ServicoImportacaoExcel.getUploadMiddleware(), controladorProdutos.importarProdutosExcel);

// GET /api/produtos/template/excel - Baixar template Excel
router.get('/template/excel', controladorProdutos.baixarTemplateExcel);

module.exports = router;
