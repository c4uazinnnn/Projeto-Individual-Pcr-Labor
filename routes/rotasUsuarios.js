// routes/rotasUsuarios.js

const express = require('express');
const router = express.Router();
const { verificarAutenticacaoAPI } = require('../middleware/autenticacao');
const controladorUsuarios = require('../controllers/controladorUsuarios');

// Aplicar middleware de autenticação em todas as rotas
router.use(verificarAutenticacaoAPI);

// Rotas API para usuários
router.get('/', controladorUsuarios.getAllUsuarios);
router.get('/:id', controladorUsuarios.getUsuarioById);
router.post('/', controladorUsuarios.createUsuario);
router.put('/:id', controladorUsuarios.updateUsuario);
router.put('/perfil', controladorUsuarios.updatePerfil); // Nova rota para perfil
router.put('/:id/senha', controladorUsuarios.updatePassword);
router.delete('/:id', controladorUsuarios.deleteUsuario);

// Rotas API para métodos de pagamento
router.get('/:id/pagamentos', controladorUsuarios.getMetodosPagamento);
router.post('/:id/pagamentos', controladorUsuarios.addMetodoPagamento);
router.put('/:id/pagamentos/:metodoId', controladorUsuarios.updateMetodoPagamento);
router.delete('/:id/pagamentos/:metodoId', controladorUsuarios.deleteMetodoPagamento);

module.exports = router;
