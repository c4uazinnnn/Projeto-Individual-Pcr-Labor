// routes/rotasPedidos.js

const express = require('express');
const router = express.Router();
const { verificarAutenticacaoAPI } = require('../middleware/autenticacao');
const controladorPedidos = require('../controllers/controladorPedidos');

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarAutenticacaoAPI);

// Rotas API para pedidos
router.get('/', controladorPedidos.getAllPedidos);
router.get('/:id', controladorPedidos.getPedidoById);
router.post('/', controladorPedidos.createPedido);
router.put('/:id', controladorPedidos.updatePedido);
router.delete('/:id', controladorPedidos.deletePedido);
router.get('/status/resumo', controladorPedidos.getPedidosPorStatus);
router.get('/projecao/compras', controladorPedidos.getProjecaoCompras);
router.get('/relatorio/mensal', controladorPedidos.getRelatorioPedidos);

module.exports = router;
