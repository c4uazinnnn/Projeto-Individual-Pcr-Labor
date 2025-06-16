// routes/rotasPlataformas.js

const express = require('express');
const router = express.Router();
const { verificarAutenticacaoAPI } = require('../middleware/autenticacao');
const controladorPlataformas = require('../controllers/controladorPlataformas');

// Aplicar middleware de autenticação
router.use(verificarAutenticacaoAPI);

// GET /api/plataformas - Buscar todas as plataformas
router.get('/', controladorPlataformas.getAllPlataformas);

// GET /api/plataformas/vendas - Buscar vendas por plataforma
router.get('/vendas', controladorPlataformas.getVendasPorPlataforma);

// GET /api/plataformas/:id - Buscar plataforma por ID
router.get('/:id', controladorPlataformas.getPlataformaById);

// POST /api/plataformas - Criar nova plataforma
router.post('/', controladorPlataformas.createPlataforma);

// PUT /api/plataformas/:id - Atualizar plataforma
router.put('/:id', controladorPlataformas.updatePlataforma);

// DELETE /api/plataformas/:id - Deletar plataforma
router.delete('/:id', controladorPlataformas.deletePlataforma);

// POST /api/plataformas/:id/sincronizar - Sincronizar plataforma específica
router.post('/:id/sincronizar', controladorPlataformas.sincronizarPlataforma);

module.exports = router;
