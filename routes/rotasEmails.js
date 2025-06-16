// routes/rotasEmails.js

const express = require('express');
const router = express.Router();
const { verificarAutenticacaoAPI } = require('../middleware/autenticacao');
const controladorEmails = require('../controllers/controladorEmails');

// Aplicar middleware de autenticação
router.use(verificarAutenticacaoAPI);

// GET /api/emails - Buscar todos os emails
router.get('/', controladorEmails.getAllEmails);

// GET /api/emails/:id - Buscar email por ID
router.get('/:id', controladorEmails.getEmailById);

// POST /api/emails - Criar novo email
router.post('/', controladorEmails.createEmail);

// PUT /api/emails/:id - Atualizar email
router.put('/:id', controladorEmails.updateEmail);

// DELETE /api/emails/:id - Deletar email
router.delete('/:id', controladorEmails.deleteEmail);

// PUT /api/emails/:id/marcar-lido - Marcar email como lido
router.put('/:id/marcar-lido', controladorEmails.marcarComoLido);

// POST /api/emails/marcar-todos-lidos - Marcar todos como lidos
router.post('/marcar-todos-lidos', controladorEmails.marcarTodosComoLidos);

// POST /api/emails/sincronizar - Sincronizar emails
router.post('/sincronizar', controladorEmails.sincronizarEmails);

module.exports = router;
