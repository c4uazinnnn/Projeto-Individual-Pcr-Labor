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

// API endpoint para fornecedores
router.get('/api/fornecedores', async (req, res) => {
  try {
    const id_empresa = req.id_empresa;

    // Buscar fornecedores reais do banco
    const Fornecedor = require('../models/modeloFornecedores');

    const fornecedores = await Fornecedor.getAll(id_empresa).catch(() => []);

    console.log(`🏭 API Fornecedores - Encontrados: ${fornecedores.length} fornecedores`);

    res.json({
      success: true,
      data: fornecedores,
      total: fornecedores.length
    });

  } catch (error) {
    console.error('❌ Erro na API fornecedores:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      data: []
    });
  }
});

// API duplicada removida - usar /api/dashboard-stats em rotasAPI.js

module.exports = router;
