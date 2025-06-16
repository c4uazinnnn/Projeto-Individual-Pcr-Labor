// routes/rotasFornecedores.js

const express = require('express');
const router = express.Router();
const { verificarAutenticacaoAPI } = require('../middleware/autenticacao');
const controladorFornecedores = require('../controllers/controladorFornecedores');

// Aplicar middleware de autenticação
router.use(verificarAutenticacaoAPI);

// GET /api/fornecedores - Buscar todos os fornecedores
router.get('/', controladorFornecedores.getAllFornecedores);

// GET /api/fornecedores/:id - Buscar fornecedor por ID
router.get('/:id', controladorFornecedores.getFornecedorById);

// POST /api/fornecedores - Criar novo fornecedor
router.post('/', controladorFornecedores.createFornecedor);

// PUT /api/fornecedores/:id - Atualizar fornecedor
router.put('/:id', controladorFornecedores.updateFornecedor);

// DELETE /api/fornecedores/:id - Deletar fornecedor
router.delete('/:id', controladorFornecedores.deleteFornecedor);

// GET /api/fornecedores/exportar - Exportar fornecedores
router.get('/exportar', controladorFornecedores.exportarFornecedores);

// POST /api/fornecedores/importar - Importar fornecedores
router.post('/importar', controladorFornecedores.importarFornecedores);

module.exports = router;
