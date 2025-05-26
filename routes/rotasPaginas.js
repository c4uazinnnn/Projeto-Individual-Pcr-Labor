// routes/pageRoutes.js - Rotas para renderização de páginas

const express = require('express');
const router = express.Router();

// Importar middleware de autenticação
const { verificarAutenticacao } = require('../middleware/autenticacao');

// Importar controllers
const controladorDashboard = require('../controllers/controladorDashboard');
const controladorVendas = require('../controllers/controladorVendas');
const controladorProdutos = require('../controllers/controladorProdutos');
const controladorPedidos = require('../controllers/controladorPedidos');
const controladorUsuarios = require('../controllers/controladorUsuarios');

// Rota principal - redirecionar para dashboard
router.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Rotas de páginas principais (protegidas por autenticação)
router.get('/dashboard', verificarAutenticacao, controladorDashboard.renderDashboard);
router.get('/vendas', verificarAutenticacao, controladorVendas.renderVendas);
router.get('/estoque', verificarAutenticacao, controladorProdutos.renderEstoque);
router.get('/produtos', verificarAutenticacao, controladorProdutos.renderProdutos);
router.get('/pedidos', verificarAutenticacao, controladorPedidos.renderPedidos);
router.get('/plataformas', verificarAutenticacao, controladorVendas.renderPlataformas);
router.get('/perfil', verificarAutenticacao, controladorUsuarios.renderPerfil);

// Rota de emails
router.get('/emails', (req, res) => {
  res.render('pages/emails', {
    pageTitle: 'Emails - PCR Labor',
    currentPage: 'emails'
  });
});

// Rota de login
router.get('/login', (req, res) => {
  res.render('pages/login', {
    pageTitle: 'Login - PCR Labor',
    currentPage: 'login'
  });
});

// Rota de cadastro
router.get('/cadastro', controladorUsuarios.renderCadastro);
router.post('/cadastro', controladorUsuarios.processarCadastro);

// Rota de logout
router.get('/logout', controladorUsuarios.processarLogout);
router.post('/logout', controladorUsuarios.processarLogout);

// Processar login
router.post('/login', controladorUsuarios.processarLogin);

// Rota de logout
router.get('/logout', (req, res) => {
  // Limpar sessão (em produção)
  res.redirect('/login');
});

module.exports = router;
