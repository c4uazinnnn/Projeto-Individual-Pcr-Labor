const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verificarAutenticacaoAPI } = require('../middleware/autenticacao');
const Fornecedor = require('../models/modeloFornecedores');
const Tarefa = require('../models/modeloTarefas');

// ===== API DASHBOARD STATS =====
router.get('/dashboard-stats', verificarAutenticacaoAPI, async (req, res) => {
  try {
    console.log('📊 Buscando estatísticas do dashboard...');
    const id_empresa = req.id_empresa;
    console.log('🏢 Filtrando dados para empresa ID:', id_empresa);
    console.log('🔍 Middleware de autenticação funcionando:', !!req.id_empresa);

    // Buscar dados reais do banco FILTRADOS POR EMPRESA
    console.log('🔍 Executando queries com filtro de empresa:', id_empresa);

    console.log('🔍 Iniciando Promise.all com 4 queries...');
    const [
      produtosResult,
      vendasResult,
      pedidosResult,
      plataformasResult
    ] = await Promise.all([
      // Total de produtos e estoque baixo
      db.query(`
        SELECT
          COUNT(*) as total_produtos,
          COUNT(CASE WHEN estoque_atual <= 10 THEN 1 END) as produtos_estoque_baixo,
          SUM(estoque_atual * preco) as valor_total_estoque
        FROM Produto
        WHERE id_empresa = $1
      `, [id_empresa]),

      // Vendas totais
      db.query(`
        SELECT
          COUNT(*) as total_vendas,
          SUM(valor_total) as valor_total_vendas,
          COUNT(CASE WHEN DATE(data) = CURRENT_DATE THEN 1 END) as vendas_hoje,
          AVG(valor_total) as ticket_medio
        FROM Venda
        WHERE id_empresa = $1
      `, [id_empresa]),

      // Pedidos reais do banco
      db.query(`
        SELECT
          COUNT(*) as total_pedidos,
          SUM(p.valor_total) as valor_total_pedidos,
          COUNT(CASE WHEN p.status = 'PENDENTE' THEN 1 END) as pedidos_pendentes,
          COUNT(CASE WHEN p.status = 'APROVADO' THEN 1 END) as pedidos_aprovados
        FROM Pedido p
        LEFT JOIN Produto prod ON p.id_produto = prod.id_produto
        WHERE prod.id_empresa = $1
      `, [id_empresa]),

      // Vendas por plataforma
      db.query(`
        SELECT
          pl.nome,
          COUNT(v.id_venda) as total_vendas,
          SUM(v.valor_total) as valor_total,
          SUM(v.quantidade) as quantidade_total
        FROM Plataforma pl
        LEFT JOIN Venda v ON pl.id_plataforma = v.id_plataforma AND v.id_empresa = $1
        GROUP BY pl.id_plataforma, pl.nome
        ORDER BY valor_total DESC NULLS LAST
      `, [id_empresa])
    ]);

    const produtos = produtosResult.rows[0] || {};
    const vendas = vendasResult.rows[0] || {};
    const pedidos = pedidosResult.rows[0] || {};
    const plataformas = plataformasResult.rows || [];

    console.log('📊 Resultados das queries para empresa', id_empresa, ':');
    console.log('📦 Produtos:', produtos);
    console.log('💰 Vendas:', vendas);
    console.log('🛒 Pedidos:', pedidos);
    console.log('🏪 Plataformas:', plataformas.length, 'encontradas');

    // Calcular crescimento real comparando com mês anterior
    const valorTotalVendas = parseFloat(vendas.valor_total_vendas || 0);
    const vendasHoje = parseInt(vendas.vendas_hoje || 0);

    // Buscar vendas do mês anterior para comparação
    let crescimentoMensal = 0;
    try {
      const mesAnteriorResult = await db.query(`
        SELECT SUM(valor_total) as valor_mes_anterior
        FROM Venda
        WHERE EXTRACT(MONTH FROM data) = EXTRACT(MONTH FROM CURRENT_DATE) - 1
        AND EXTRACT(YEAR FROM data) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND id_empresa = $1
      `, [id_empresa]);

      const valorMesAnterior = parseFloat(mesAnteriorResult.rows[0]?.valor_mes_anterior || 0);

      if (valorMesAnterior > 0 && valorTotalVendas > 0) {
        crescimentoMensal = ((valorTotalVendas - valorMesAnterior) / valorMesAnterior * 100);
      } else if (valorTotalVendas > 0) {
        crescimentoMensal = 100; // 100% se não havia vendas no mês anterior
      }
    } catch (error) {
      console.warn('⚠️ Erro ao calcular crescimento:', error);
      // Fallback: calcular baseado em vendas diárias
      crescimentoMensal = vendasHoje > 0 ? ((vendasHoje / parseInt(vendas.total_vendas || 1)) * 100) : 0;
    }

    const stats = {
      success: true,
      data: {
        // Produtos
        totalProdutos: parseInt(produtos.total_produtos || 0),
        produtosEstoqueBaixo: parseInt(produtos.produtos_estoque_baixo || 0),
        valorTotalEstoque: parseFloat(produtos.valor_total_estoque || 0),

        // Vendas
        totalVendas: parseInt(vendas.total_vendas || 0),
        valorTotalVendas: valorTotalVendas,
        vendasHoje: vendasHoje,
        ticketMedio: parseFloat(vendas.ticket_medio || 0),
        crescimentoMensal: parseFloat(crescimentoMensal.toFixed(1)),

        // Pedidos
        totalPedidos: parseInt(pedidos.total_pedidos || 0),
        valorTotalPedidos: parseFloat(pedidos.valor_total_pedidos || 0),
        pedidosPendentes: parseInt(pedidos.pedidos_pendentes || 0),
        pedidosAprovados: parseInt(pedidos.pedidos_aprovados || 0),

        // Plataformas
        plataformas: plataformas.map(p => ({
          nome: p.nome || 'Não informado',
          total_vendas: parseInt(p.total_vendas || 0),
          valor_total: parseFloat(p.valor_total || 0),
          quantidade_total: parseInt(p.quantidade_total || 0)
        })),

        // Produto mais vendido
        produtoMaisVendido: 'Kit PCR COVID-19', // Será calculado dinamicamente depois

        // Última atualização
        ultimaAtualizacao: new Date().toISOString()
      }
    };

    console.log('✅ Estatísticas calculadas:', stats.data);
    res.json(stats);

  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// ===== API VENDAS POR PERÍODO =====
router.get('/vendas-periodo/:periodo', verificarAutenticacaoAPI, async (req, res) => {
  try {
    const { periodo } = req.params;
    const id_empresa = req.id_empresa; // Filtrar por empresa
    let whereClause = `WHERE v.id_empresa = $1`;
    const params = [id_empresa];

    switch (periodo) {
      case 'hoje':
        whereClause += " AND DATE(v.data) = CURRENT_DATE";
        break;
      case 'semana':
        whereClause += " AND v.data >= CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'mes':
        whereClause += " AND EXTRACT(MONTH FROM v.data) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM v.data) = EXTRACT(YEAR FROM CURRENT_DATE)";
        break;
      case 'ano':
        whereClause += " AND EXTRACT(YEAR FROM v.data) = EXTRACT(YEAR FROM CURRENT_DATE)";
        break;
      default:
        // Manter apenas filtro por empresa
        break;
    }

    const query = `
      SELECT
        DATE(v.data) as data,
        COUNT(*) as total_vendas,
        SUM(v.valor_total) as valor_total,
        SUM(v.quantidade) as quantidade_total
      FROM Venda v
      ${whereClause}
      GROUP BY DATE(v.data)
      ORDER BY data DESC
      LIMIT 30
    `;

    console.log('📊 Query vendas por período:', query);
    console.log('📊 Parâmetros:', params);

    const result = await db.query(query, params);

    console.log(`📊 Vendas encontradas para ${periodo}:`, result.rows.length);

    res.json({
      success: true,
      data: result.rows,
      periodo: periodo,
      empresa: id_empresa
    });

  } catch (error) {
    console.error('❌ Erro ao buscar vendas por período:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== API PRODUTOS MAIS VENDIDOS (ABC) =====
router.get('/produtos-abc', verificarAutenticacaoAPI, async (req, res) => {
  try {
    const id_empresa = req.id_empresa;

    const query = `
      SELECT
        p.nome,
        p.sku,
        SUM(v.quantidade) as total_vendido,
        SUM(v.valor_total) as receita_total,
        COUNT(v.id_venda) as numero_vendas,
        AVG(v.valor_total) as ticket_medio
      FROM Produto p
      LEFT JOIN Venda v ON p.id_produto = v.id_produto AND v.id_empresa = $1
      WHERE p.id_empresa = $1
      GROUP BY p.id_produto, p.nome, p.sku
      ORDER BY total_vendido DESC NULLS LAST
    `;

    const result = await db.query(query, [id_empresa]);
    const produtos = result.rows;

    // Classificação ABC
    const totalVendido = produtos.reduce((sum, p) => sum + (parseInt(p.total_vendido) || 0), 0);
    let acumulado = 0;

    const produtosABC = produtos.map(produto => {
      const vendido = parseInt(produto.total_vendido) || 0;
      acumulado += vendido;
      const percentualAcumulado = totalVendido > 0 ? (acumulado / totalVendido) * 100 : 0;

      let classificacao = 'C';
      if (percentualAcumulado <= 80) classificacao = 'A';
      else if (percentualAcumulado <= 95) classificacao = 'B';

      return {
        ...produto,
        total_vendido: vendido,
        receita_total: parseFloat(produto.receita_total || 0),
        numero_vendas: parseInt(produto.numero_vendas || 0),
        ticket_medio: parseFloat(produto.ticket_medio || 0),
        classificacao_abc: classificacao,
        percentual_acumulado: percentualAcumulado.toFixed(1)
      };
    });

    res.json({
      success: true,
      data: produtosABC,
      resumo: {
        total_produtos: produtos.length,
        classe_a: produtosABC.filter(p => p.classificacao_abc === 'A').length,
        classe_b: produtosABC.filter(p => p.classificacao_abc === 'B').length,
        classe_c: produtosABC.filter(p => p.classificacao_abc === 'C').length
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar análise ABC:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== API MOVIMENTAÇÕES DE ESTOQUE =====
router.get('/estoque-movimentacoes', verificarAutenticacaoAPI, async (req, res) => {
  try {
    const id_empresa = req.id_empresa;

    // Buscar movimentações baseadas nas vendas
    const query = `
      SELECT
        p.nome as produto,
        v.quantidade,
        v.data as data_movimentacao,
        'SAÍDA' as tipo_movimentacao,
        'VENDA' as motivo,
        pl.nome as origem
      FROM Venda v
      LEFT JOIN Produto p ON v.id_produto = p.id_produto
      LEFT JOIN Plataforma pl ON v.id_plataforma = pl.id_plataforma
      WHERE v.id_empresa = $1
      ORDER BY v.data DESC
      LIMIT 50
    `;

    const result = await db.query(query, [id_empresa]);

    res.json({
      success: true,
      data: result.rows.map(mov => ({
        ...mov,
        quantidade: parseInt(mov.quantidade),
        data_movimentacao: mov.data_movimentacao
      }))
    });

  } catch (error) {
    console.error('❌ Erro ao buscar movimentações:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});



// ===== APIs DE EMAIL =====

// Array para simular emails (em produção seria banco de dados)
let emailsSimulados = [
  {
    id: 1,
    remetente: 'Mercado Livre',
    email_remetente: 'noreply@mercadolivre.com.br',
    assunto: 'Nova venda realizada - Kit PCR COVID-19',
    corpo: 'Parabéns! Você vendeu 1 unidade do Kit PCR COVID-19 por R$ 89,90. O pagamento foi aprovado e o produto deve ser enviado em até 24 horas.',
    categoria: 'VENDAS',
    prioridade: 'normal',
    lido: false,
    data_recebimento: new Date().toISOString(),
    cor_categoria: '#16a34a'
  },
  {
    id: 2,
    remetente: 'Shopee',
    email_remetente: 'noreply@shopee.com.br',
    assunto: 'Alerta de estoque baixo - Kit PCR Dengue',
    corpo: 'Atenção! O estoque do produto Kit PCR Dengue está baixo (5 unidades restantes). Recomendamos fazer um novo pedido para evitar rupturas.',
    categoria: 'ESTOQUE',
    prioridade: 'alta',
    lido: true,
    data_recebimento: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    cor_categoria: '#f59e0b'
  },
  {
    id: 3,
    remetente: 'PCR Labor',
    email_remetente: 'sistema@pcrlabor.com',
    assunto: 'Relatório mensal de vendas disponível',
    corpo: 'Seu relatório mensal de janeiro está pronto para download. Vendas totais: R$ 45.230,00. Acesse o dashboard para mais detalhes.',
    categoria: 'SISTEMA',
    prioridade: 'normal',
    lido: true,
    data_recebimento: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    cor_categoria: '#2563eb'
  }
];

// Listar emails
router.get('/emails', (req, res) => {
  try {
    console.log('📧 Buscando emails...');

    const emails = emailsSimulados.map(email => ({
      ...email,
      corpo_preview: email.corpo.substring(0, 100) + '...'
    }));

    res.json({
      success: true,
      data: {
        emails: emails,
        total: emails.length,
        nao_lidos: emails.filter(e => !e.lido).length,
        lidos: emails.filter(e => e.lido).length
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar emails:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar emails'
    });
  }
});

// Enviar novo email
router.post('/emails', (req, res) => {
  try {
    console.log('📤 Enviando novo email:', req.body);

    const { email_destinatario, assunto, corpo, prioridade, categoria } = req.body;

    if (!email_destinatario || !assunto || !corpo) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: email_destinatario, assunto, corpo'
      });
    }

    const novoEmail = {
      id: emailsSimulados.length + 1,
      remetente: 'PCR Labor',
      email_remetente: 'sistema@pcrlabor.com',
      email_destinatario,
      assunto,
      corpo,
      categoria: categoria || 'GERAL',
      prioridade: prioridade || 'normal',
      lido: false,
      enviado: true,
      data_envio: new Date().toISOString(),
      cor_categoria: '#6b7280'
    };

    // Simular envio (em produção integraria com serviço de email)
    emailsSimulados.push(novoEmail);

    console.log(`✅ Email enviado para: ${email_destinatario}`);

    res.json({
      success: true,
      data: {
        id: novoEmail.id,
        message: 'Email enviado com sucesso'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao enviar email'
    });
  }
});

// Marcar email como lido
router.put('/emails/:id/marcar-lido', (req, res) => {
  try {
    const emailId = parseInt(req.params.id);
    const email = emailsSimulados.find(e => e.id === emailId);

    if (!email) {
      return res.status(404).json({
        success: false,
        error: 'Email não encontrado'
      });
    }

    email.lido = true;
    email.data_leitura = new Date().toISOString();

    console.log(`✅ Email ${emailId} marcado como lido`);

    res.json({
      success: true,
      data: {
        message: 'Email marcado como lido'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao marcar email como lido:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao marcar email como lido'
    });
  }
});

// Sincronizar emails (simular busca em plataformas)
router.post('/emails/sincronizar', (req, res) => {
  try {
    console.log('🔄 Sincronizando emails...');

    // Simular novos emails de plataformas
    const novosEmails = [
      {
        id: emailsSimulados.length + 1,
        remetente: 'Mercado Livre',
        email_remetente: 'noreply@mercadolivre.com.br',
        assunto: 'Pergunta sobre produto - Kit PCR Zika',
        corpo: 'Um comprador fez uma pergunta sobre o Kit PCR Zika: "Este kit detecta todas as variantes do vírus Zika?"',
        categoria: 'PERGUNTA',
        prioridade: 'normal',
        lido: false,
        data_recebimento: new Date().toISOString(),
        cor_categoria: '#8b5cf6'
      },
      {
        id: emailsSimulados.length + 2,
        remetente: 'Fornecedor BioTech',
        email_remetente: 'vendas@biotech.com',
        assunto: 'Promoção especial - Kits PCR',
        corpo: 'Oferta especial para este mês: 20% de desconto em pedidos acima de 100 unidades de qualquer kit PCR.',
        categoria: 'PROMOCAO',
        prioridade: 'baixa',
        lido: false,
        data_recebimento: new Date().toISOString(),
        cor_categoria: '#f59e0b'
      }
    ];

    emailsSimulados.push(...novosEmails);

    console.log(`✅ ${novosEmails.length} novos emails sincronizados`);

    res.json({
      success: true,
      data: {
        novos_emails: novosEmails.length,
        message: 'Sincronização concluída'
      }
    });

  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    res.status(500).json({
      success: false,
      error: 'Erro na sincronização'
    });
  }
});

// ===== APIs DE FORNECEDORES (BANCO REAL) =====

// Listar fornecedores da empresa
router.get('/fornecedores', verificarAutenticacaoAPI, async (req, res) => {
  try {
    console.log('📋 Buscando fornecedores do banco...');

    const id_empresa = req.id_empresa; // Vem do middleware de autenticação

    const fornecedores = await Fornecedor.getAll(id_empresa);

    console.log(`✅ ${fornecedores.length} fornecedores encontrados para empresa ${id_empresa}`);

    res.json({
      success: true,
      data: fornecedores
    });

  } catch (error) {
    console.error('❌ Erro ao buscar fornecedores:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar fornecedores'
    });
  }
});

// Criar novo fornecedor
router.post('/fornecedores', verificarAutenticacaoAPI, async (req, res) => {
  try {
    console.log('➕ Criando novo fornecedor:', req.body);

    const {
      nome, cnpj, contato, telefone, email, site,
      endereco, categoria, status, observacoes
    } = req.body;

    // Validações básicas
    if (!nome || !telefone || !email) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: nome, telefone, email'
      });
    }

    // Usar empresa do usuário logado
    const idEmpresa = req.id_empresa;

    const fornecedorData = {
      id_empresa: idEmpresa,
      nome,
      cnpj: cnpj || null,
      email,
      telefone,
      endereco: endereco || null,
      observacoes: observacoes || null
    };

    const novoFornecedor = await Fornecedor.create(fornecedorData);

    console.log(`✅ Fornecedor criado com ID: ${novoFornecedor.id_fornecedor}`);

    res.json({
      success: true,
      data: {
        id_fornecedor: novoFornecedor.id_fornecedor,
        message: 'Fornecedor criado com sucesso'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar fornecedor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar fornecedor'
    });
  }
});

// Atualizar fornecedor
router.put('/fornecedores/:id', verificarAutenticacaoAPI, async (req, res) => {
  try {
    const idFornecedor = req.params.id;
    console.log(`✏️ Atualizando fornecedor ID: ${idFornecedor}`);

    const {
      nome, cnpj, contato, telefone, email, site,
      endereco, categoria, status, observacoes
    } = req.body;

    // Validações básicas
    if (!nome || !telefone || !email) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: nome, telefone, email'
      });
    }

    const fornecedorData = {
      nome,
      cnpj: cnpj || null,
      email,
      telefone,
      endereco: endereco || null,
      observacoes: observacoes || null
    };

    const fornecedorAtualizado = await Fornecedor.update(idFornecedor, fornecedorData);

    if (!fornecedorAtualizado) {
      return res.status(404).json({
        success: false,
        error: 'Fornecedor não encontrado'
      });
    }

    console.log(`✅ Fornecedor ${idFornecedor} atualizado`);

    res.json({
      success: true,
      data: {
        message: 'Fornecedor atualizado com sucesso'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar fornecedor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar fornecedor'
    });
  }
});

// Deletar fornecedor
router.delete('/fornecedores/:id', verificarAutenticacaoAPI, async (req, res) => {
  try {
    const idFornecedor = req.params.id;
    console.log(`🗑️ Deletando fornecedor ID: ${idFornecedor}`);

    const fornecedorDeletado = await Fornecedor.delete(idFornecedor);

    if (!fornecedorDeletado) {
      return res.status(404).json({
        success: false,
        error: 'Fornecedor não encontrado'
      });
    }

    console.log(`✅ Fornecedor ${idFornecedor} deletado`);

    res.json({
      success: true,
      data: {
        message: 'Fornecedor deletado com sucesso'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao deletar fornecedor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar fornecedor'
    });
  }
});

// ===== APIs DE TAREFAS (BANCO REAL) =====

// Listar tarefas do usuário/empresa
router.get('/tarefas', async (req, res) => {
  try {
    console.log('📋 Buscando tarefas do banco...');

    // Por enquanto usar usuário ID 1 e empresa ID 1 (depois pegar da sessão)
    const idUsuario = 1;
    const idEmpresa = 1;

    const tarefas = await Tarefa.getAll(idUsuario, idEmpresa);

    console.log(`✅ ${tarefas.length} tarefas encontradas`);

    res.json({
      success: true,
      data: tarefas
    });

  } catch (error) {
    console.error('❌ Erro ao buscar tarefas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar tarefas'
    });
  }
});

// Criar nova tarefa
router.post('/tarefas', async (req, res) => {
  try {
    console.log('➕ Criando nova tarefa:', req.body);

    const { titulo, descricao, prioridade, status } = req.body;

    // Validações básicas
    if (!titulo) {
      return res.status(400).json({
        success: false,
        error: 'Campo obrigatório: titulo'
      });
    }

    // Por enquanto usar usuário ID 1
    const idUsuario = 1;

    const tarefaData = {
      id_usuario: idUsuario,
      titulo,
      descricao: descricao || '',
      prioridade: prioridade || 'media',
      status: status || 'a_fazer'
    };

    const novaTarefa = await Tarefa.create(tarefaData);

    console.log(`✅ Tarefa criada com ID: ${novaTarefa.id_tarefa}`);

    res.json({
      success: true,
      data: {
        id_tarefa: novaTarefa.id_tarefa,
        message: 'Tarefa criada com sucesso'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar tarefa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar tarefa'
    });
  }
});

// Atualizar tarefa
router.put('/tarefas/:id', async (req, res) => {
  try {
    const idTarefa = req.params.id;
    console.log(`✏️ Atualizando tarefa ID: ${idTarefa}`);

    const { titulo, descricao, prioridade, status } = req.body;

    const tarefaData = {
      titulo,
      descricao,
      prioridade,
      status
    };

    const tarefaAtualizada = await Tarefa.update(idTarefa, tarefaData);

    if (!tarefaAtualizada) {
      return res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada'
      });
    }

    console.log(`✅ Tarefa ${idTarefa} atualizada`);

    res.json({
      success: true,
      data: {
        message: 'Tarefa atualizada com sucesso'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar tarefa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar tarefa'
    });
  }
});

// Deletar tarefa
router.delete('/tarefas/:id', async (req, res) => {
  try {
    const idTarefa = req.params.id;
    console.log(`🗑️ Deletando tarefa ID: ${idTarefa}`);

    const tarefaDeletada = await Tarefa.delete(idTarefa);

    if (!tarefaDeletada) {
      return res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada'
      });
    }

    console.log(`✅ Tarefa ${idTarefa} deletada`);

    res.json({
      success: true,
      data: {
        message: 'Tarefa deletada com sucesso'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao deletar tarefa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar tarefa'
    });
  }
});



module.exports = router;
