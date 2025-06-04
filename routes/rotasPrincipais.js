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
router.post('/api/sync-data', controladorDashboard.syncData);
router.get('/api/metrics', controladorDashboard.getMetrics);

// Rotas de páginas
router.get('/produtos', controladorProdutos.renderProdutos);
router.get('/estoque', controladorProdutos.renderEstoque);
router.get('/vendas', controladorVendas.renderVendas);
router.get('/plataformas', controladorVendas.renderPlataformas);

// Rota para fornecedores
router.get('/fornecedores', (req, res) => {
  res.render('pages/fornecedores', {
    pageTitle: 'Fornecedores - PCR Labor',
    currentPage: 'fornecedores',
    usuario: req.usuario || { nome: 'Usuário', empresa_nome: 'PCR Labor' }
  });
});

module.exports = router;
