// routes/rotasTarefas.js

const express = require('express');
const router = express.Router();
const controladorTarefas = require('../controllers/controladorTarefas');

// Rotas API para tarefas (sem autenticação temporariamente para debug)
router.get('/', controladorTarefas.getAllTarefas);
router.get('/pendentes', controladorTarefas.getPendentes);
router.get('/estatisticas', controladorTarefas.getEstatisticas);
router.get('/:id', controladorTarefas.getTarefaById);
router.post('/', controladorTarefas.createTarefa);
router.put('/:id', controladorTarefas.updateTarefa);
router.patch('/:id/toggle', controladorTarefas.toggleTarefa);
router.delete('/:id', controladorTarefas.deleteTarefa);

module.exports = router;
