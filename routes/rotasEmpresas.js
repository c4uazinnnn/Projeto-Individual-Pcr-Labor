// routes/rotasEmpresas.js

const express = require('express');
const router = express.Router();
const controladorEmpresas = require('../controllers/controladorEmpresas');

// GET /api/empresas - Buscar todas as empresas
router.get('/', controladorEmpresas.getAllEmpresas);

// GET /api/empresas/:id - Buscar empresa por ID
router.get('/:id', controladorEmpresas.getEmpresaById);

// POST /api/empresas - Criar nova empresa
router.post('/', controladorEmpresas.createEmpresa);

// PUT /api/empresas/:id - Atualizar empresa
router.put('/:id', controladorEmpresas.updateEmpresa);

// DELETE /api/empresas/:id - Deletar empresa
router.delete('/:id', controladorEmpresas.deleteEmpresa);

module.exports = router;
