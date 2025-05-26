const express = require('express');
const router = express.Router();
const controladorDashboard = require('../controllers/controladorDashboard');
const controladorProdutos = require('../controllers/controladorProdutos');
const controladorVendas = require('../controllers/controladorVendas');

// Rota principal - redireciona para login
router.get('/', (req, res) => {
  res.redirect('/login');
});

// Rotas de autenticação
router.get('/login', controladorDashboard.renderLogin);
router.post('/login', controladorDashboard.processLogin);

// Dashboard principal
router.get('/dashboard', controladorDashboard.renderDashboard);

// APIs do dashboard
router.post('/api/sync-data', controladorDashboard.syncData);
router.get('/api/metrics', controladorDashboard.getMetrics);

// Rotas de páginas
router.get('/produtos', controladorProdutos.renderProdutos);
router.get('/estoque', controladorProdutos.renderEstoque);
router.get('/vendas', controladorVendas.renderVendas);
router.get('/plataformas', controladorVendas.renderPlataformas);

module.exports = router;
