// controllers/controladorFornecedores.js

const Fornecedor = require('../models/modeloFornecedores');

// API endpoints
const getAllFornecedores = async (req, res) => {
  try {
    const id_empresa = req.id_empresa; // Vem do middleware
    console.log(`🏭 API Fornecedores - Buscando para empresa ID: ${id_empresa}`);

    const fornecedores = await Fornecedor.getAll(id_empresa);

    console.log(`✅ API Fornecedores - Encontrados: ${fornecedores.length} fornecedores`);

    res.status(200).json({
      success: true,
      data: fornecedores,
      message: 'Fornecedores recuperados com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao buscar fornecedores:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getFornecedorById = async (req, res) => {
  try {
    const id_empresa = req.id_empresa; // Vem do middleware
    const { id } = req.params;

    const fornecedor = await Fornecedor.getById(id);

    // Verificar se o fornecedor pertence à empresa do usuário
    if (!fornecedor || fornecedor.id_empresa !== id_empresa) {
      return res.status(404).json({
        success: false,
        error: 'Fornecedor não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: fornecedor,
      message: 'Fornecedor recuperado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const createFornecedor = async (req, res) => {
  try {
    const id_empresa = req.id_empresa; // Vem do middleware
    const { nome, cnpj, email, telefone, endereco, observacoes } = req.body;

    // Validações
    if (!nome || !cnpj) {
      return res.status(400).json({
        success: false,
        error: 'Nome e CNPJ são obrigatórios'
      });
    }

    // Dados do fornecedor
    const fornecedorData = {
      id_empresa,
      nome,
      cnpj,
      email,
      telefone,
      endereco,
      observacoes
    };

    console.log(`🏭 Criando novo fornecedor para empresa ID: ${id_empresa}`);
    console.log(`📋 Dados: ${nome} (${cnpj})`);

    const fornecedor = await Fornecedor.create(fornecedorData);

    console.log(`✅ Fornecedor criado com sucesso! ID: ${fornecedor.id_fornecedor}`);

    res.status(201).json({
      success: true,
      data: fornecedor,
      message: 'Fornecedor criado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar fornecedor:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const updateFornecedor = async (req, res) => {
  try {
    const id_empresa = req.id_empresa; // Vem do middleware
    const { id } = req.params;
    const { nome, cnpj, email, telefone, endereco, observacoes } = req.body;

    // Verificar se o fornecedor pertence à empresa do usuário
    const fornecedor = await Fornecedor.getById(id);
    if (!fornecedor || fornecedor.id_empresa !== id_empresa) {
      return res.status(404).json({
        success: false,
        error: 'Fornecedor não encontrado'
      });
    }

    // Dados atualizados
    const fornecedorData = {
      nome,
      cnpj,
      email,
      telefone,
      endereco,
      observacoes
    };

    const updatedFornecedor = await Fornecedor.update(id, fornecedorData);

    res.status(200).json({
      success: true,
      data: updatedFornecedor,
      message: 'Fornecedor atualizado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const deleteFornecedor = async (req, res) => {
  try {
    const id_empresa = req.id_empresa; // Vem do middleware
    const { id } = req.params;

    // Verificar se o fornecedor pertence à empresa do usuário
    const fornecedor = await Fornecedor.getById(id);
    if (!fornecedor || fornecedor.id_empresa !== id_empresa) {
      return res.status(404).json({
        success: false,
        error: 'Fornecedor não encontrado'
      });
    }

    await Fornecedor.delete(id);

    res.status(200).json({
      success: true,
      message: 'Fornecedor deletado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Renderizar página de fornecedores
const renderFornecedores = async (req, res) => {
  try {
    const id_empresa = req.id_empresa;
    const usuario = req.usuario;

    console.log(`🏭 Renderizando página de fornecedores para empresa ${usuario.empresa_nome}`);

    // Buscar dados para a página
    const fornecedores = await Fornecedor.getAll(id_empresa);

    // Calcular estatísticas
    const stats = {
      total: fornecedores.length,
      ativos: fornecedores.filter(f => (f.total_pedidos || 0) > 0).length,
      inativos: fornecedores.filter(f => (f.total_pedidos || 0) === 0).length,
      valorTotal: fornecedores.reduce((total, f) => total + (f.valor_total_pedidos || 0), 0)
    };

    res.render('pages/fornecedores', {
      pageTitle: `Fornecedores - ${usuario.empresa_nome}`,
      currentPage: 'fornecedores',
      usuario,
      fornecedores,
      stats
    });
  } catch (error) {
    console.error('❌ Erro ao renderizar página de fornecedores:', error);
    res.status(500).render('pages/error', {
      pageTitle: 'Erro - PCR Labor',
      error: 'Erro ao carregar página de fornecedores'
    });
  }
};

// Exportar fornecedores para Excel
const exportarFornecedores = async (req, res) => {
  try {
    const id_empresa = req.id_empresa;
    const fornecedores = await Fornecedor.getAll(id_empresa);

    // Preparar dados para exportação
    const dadosExportacao = fornecedores.map(f => ({
      'ID': f.id_fornecedor,
      'Nome': f.nome,
      'CNPJ': f.cnpj || '',
      'Email': f.email || '',
      'Telefone': f.telefone || '',
      'Endereço': f.endereco || '',
      'Total Pedidos': f.total_pedidos || 0,
      'Valor Total': f.valor_total_pedidos || 0,
      'Data Cadastro': new Date(f.created_at).toLocaleDateString('pt-BR')
    }));

    res.json({
      success: true,
      data: dadosExportacao,
      message: 'Dados preparados para exportação'
    });
  } catch (error) {
    console.error('❌ Erro ao exportar fornecedores:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao exportar fornecedores'
    });
  }
};

// Importar fornecedores via Excel
const importarFornecedores = async (req, res) => {
  try {
    const id_empresa = req.id_empresa;
    const { fornecedores } = req.body;

    if (!fornecedores || !Array.isArray(fornecedores)) {
      return res.status(400).json({
        success: false,
        error: 'Dados de fornecedores inválidos'
      });
    }

    const resultados = {
      sucesso: 0,
      erros: 0,
      detalhes: []
    };

    for (const fornecedor of fornecedores) {
      try {
        // Validar dados obrigatórios
        if (!fornecedor.nome || !fornecedor.email || !fornecedor.telefone) {
          resultados.erros++;
          resultados.detalhes.push({
            linha: fornecedor.linha || 'N/A',
            erro: 'Nome, email e telefone são obrigatórios',
            fornecedor: fornecedor.nome || 'Sem nome'
          });
          continue;
        }

        // Criar fornecedor
        const novoFornecedor = await Fornecedor.create({
          id_empresa,
          nome: fornecedor.nome,
          cnpj: fornecedor.cnpj || null,
          email: fornecedor.email,
          telefone: fornecedor.telefone,
          endereco: fornecedor.endereco || null,
          observacoes: fornecedor.observacoes || null
        });

        resultados.sucesso++;
        resultados.detalhes.push({
          linha: fornecedor.linha || 'N/A',
          sucesso: true,
          fornecedor: fornecedor.nome,
          id_fornecedor: novoFornecedor.id_fornecedor
        });

      } catch (error) {
        resultados.erros++;
        resultados.detalhes.push({
          linha: fornecedor.linha || 'N/A',
          erro: error.message,
          fornecedor: fornecedor.nome || 'Erro na linha'
        });
      }
    }

    res.json({
      success: true,
      data: resultados,
      message: `Importação concluída: ${resultados.sucesso} sucessos, ${resultados.erros} erros`
    });
  } catch (error) {
    console.error('❌ Erro ao importar fornecedores:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao importar fornecedores'
    });
  }
};

module.exports = {
  getAllFornecedores,
  getFornecedorById,
  createFornecedor,
  updateFornecedor,
  deleteFornecedor,
  renderFornecedores,
  exportarFornecedores,
  importarFornecedores
};
