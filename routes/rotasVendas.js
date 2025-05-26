// routes/vendaRoutes.js

const express = require('express');
const router = express.Router();
const { verificarAutenticacaoAPI } = require('../middleware/autenticacao');
const controladorVendas = require('../controllers/controladorVendas');

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarAutenticacaoAPI);
const controladorPedidos = require('../controllers/controladorPedidos');
const controladorUsuarios = require('../controllers/controladorUsuarios');

// GET /api/vendas - Buscar todas as vendas
router.get('/', controladorVendas.getAllVendas);

// GET /api/vendas/periodo - Buscar vendas por período
router.get('/periodo', controladorVendas.getVendasPorPeriodo);

// GET /api/vendas/relatorio - Relatório de vendas
router.get('/relatorio', controladorVendas.getRelatorioVendas);

// GET /api/vendas/:id - Buscar venda por ID
router.get('/:id', controladorVendas.getVendaById);

// POST /api/vendas - Criar nova venda
router.post('/', controladorVendas.createVenda);

// PUT /api/vendas/:id - Atualizar venda
router.put('/:id', controladorVendas.updateVenda);

// DELETE /api/vendas/:id - Deletar venda
router.delete('/:id', controladorVendas.deleteVenda);

// Rotas de renderização removidas - agora estão em pageRoutes.js

// Essas rotas foram movidas para arquivos específicos
// As rotas de usuários agora estão em rotasUsuarios.js
// As rotas de pedidos agora estão em rotasPedidos.js

module.exports = router;
