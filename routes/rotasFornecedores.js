// routes/rotasFornecedores.js

const express = require('express');
const router = express.Router();
const { verificarAutenticacaoAPI } = require('../middleware/autenticacao');
const controladorFornecedores = require('../controllers/controladorFornecedores');

// Middleware temporário para simular autenticação durante debug
const middlewareTemporario = (req, res, next) => {
  // Simular dados de usuário para teste
  req.id_empresa = 1;
  req.usuario = {
    id_usuario: 1,
    nome: 'Admin',
    email: 'admin@pcrlabor.com',
    id_empresa: 1,
    empresa_nome: 'PCR Labor'
  };
  next();
};

// Aplicar middleware temporário em vez do de autenticação
router.use(middlewareTemporario);

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

module.exports = router;
