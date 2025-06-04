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

module.exports = {
  getAllFornecedores,
  getFornecedorById,
  createFornecedor,
  updateFornecedor,
  deleteFornecedor
};
