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

// API endpoint para dados do dashboard
router.get('/api/dashboard-stats', async (req, res) => {
  try {
    const id_empresa = req.id_empresa;

    // Buscar dados reais do banco
    const Produto = require('../models/modeloProdutos');
    const Venda = require('../models/modeloVendas');
    const Pedido = require('../models/modeloPedidos');

    const [produtos, vendas, pedidos] = await Promise.all([
      Produto.getAll(id_empresa).catch(() => []),
      Venda.getAll(id_empresa).catch(() => []),
      Pedido.getAll(id_empresa).catch(() => [])
    ]);

    // Calcular métricas
    const totalProdutos = produtos.length;
    const produtosEstoqueBaixo = produtos.filter(p => p.estoque_atual <= 10).length;
    const totalVendas = vendas.length;
    const totalPedidos = pedidos.length;
    const valorTotalVendas = vendas.reduce((total, v) => total + parseFloat(v.valor_total || 0), 0);

    // Agrupar vendas por plataforma
    const vendasPorPlataforma = vendas.reduce((acc, venda) => {
      const plataforma = venda.plataforma || 'Site Próprio';
      if (!acc[plataforma]) {
        acc[plataforma] = { nome: plataforma, valor_total: 0, total_vendas: 0, quantidade_total: 0 };
      }
      acc[plataforma].valor_total += parseFloat(venda.valor_total || 0);
      acc[plataforma].total_vendas += 1;
      acc[plataforma].quantidade_total += parseInt(venda.quantidade || 1);
      return acc;
    }, {});

    // Garantir que todas as plataformas principais existam
    const plataformasBase = ['Shopee', 'Mercado Livre', 'Site Próprio'];
    plataformasBase.forEach(nome => {
      if (!vendasPorPlataforma[nome]) {
        vendasPorPlataforma[nome] = { nome, valor_total: 0, total_vendas: 0, quantidade_total: 0 };
      }
    });

    const plataformas = Object.values(vendasPorPlataforma);

    const stats = {
      totalProdutos,
      produtosEstoqueBaixo,
      totalVendas,
      totalPedidos,
      valorTotalVendas,
      plataformas
    };

    console.log('📊 API Dashboard Stats:', stats);
    res.json(stats);

  } catch (error) {
    console.error('❌ Erro na API dashboard-stats:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
