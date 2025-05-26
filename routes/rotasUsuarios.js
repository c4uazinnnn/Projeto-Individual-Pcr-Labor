// routes/rotasUsuarios.js

const express = require('express');
const router = express.Router();
const controladorUsuarios = require('../controllers/controladorUsuarios');

// Rotas API para usuários
router.get('/', controladorUsuarios.getAllUsuarios);
router.get('/:id', controladorUsuarios.getUsuarioById);
router.post('/', controladorUsuarios.createUsuario);
router.put('/:id', controladorUsuarios.updateUsuario);
router.put('/:id/senha', controladorUsuarios.updatePassword);
router.delete('/:id', controladorUsuarios.deleteUsuario);

// Rotas API para métodos de pagamento
router.get('/:id/pagamentos', controladorUsuarios.getMetodosPagamento);
router.post('/:id/pagamentos', controladorUsuarios.addMetodoPagamento);
router.put('/:id/pagamentos/:metodoId', controladorUsuarios.updateMetodoPagamento);
router.delete('/:id/pagamentos/:metodoId', controladorUsuarios.deleteMetodoPagamento);

module.exports = router;
