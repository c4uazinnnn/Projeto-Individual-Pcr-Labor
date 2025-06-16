const express = require('express');
const router = express.Router();
const controladorDashboard = require('../controllers/controladorDashboard');
const controladorProdutos = require('../controllers/controladorProdutos');
const controladorVendas = require('../controllers/controladorVendas');

// Rota principal - redireciona para login
router.get('/', (req, res) => {
  res.redirect('/login');
});

// Rotas de autenticação (GET apenas - POST está em rotasPaginas.js)
router.get('/login', controladorDashboard.renderLogin);

// Dashboard principal
router.get('/dashboard', controladorDashboard.renderDashboard);

// APIs do dashboard
const { verificarAutenticacao } = require('../middleware/autenticacao');
router.post('/api/sync-data', verificarAutenticacao, controladorDashboard.syncData);
// router.get('/api/metrics', verificarAutenticacao, controladorDashboard.getMetrics); // DESABILITADO - usar /api/dashboard-stats

// Rotas de páginas
router.get('/produtos', controladorProdutos.renderProdutos);
router.get('/estoque', controladorProdutos.renderEstoque);
router.get('/vendas', controladorVendas.renderVendas);
router.get('/plataformas', controladorVendas.renderPlataformas);

// Rota de fornecedores movida para rotasPaginas.js



module.exports = router;
