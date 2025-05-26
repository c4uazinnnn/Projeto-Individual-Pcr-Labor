// controllers/controladorEmpresas.js

const Empresa = require('../models/modeloEmpresa');

// API endpoints
const getAllEmpresas = async (req, res) => {
  try {
    const empresas = await Empresa.getAll();
    res.status(200).json({
      success: true,
      data: empresas,
      message: 'Empresas recuperadas com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getEmpresaById = async (req, res) => {
  try {
    const empresa = await Empresa.getById(req.params.id);
    if (empresa) {
      res.status(200).json({
        success: true,
        data: empresa,
        message: 'Empresa encontrada'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Empresa não encontrada'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const createEmpresa = async (req, res) => {
  try {
    const { nome_fantasia, cnpj } = req.body;
    
    // Validações básicas
    if (!nome_fantasia || !cnpj) {
      return res.status(400).json({
        success: false,
        error: 'Nome fantasia e CNPJ são obrigatórios'
      });
    }

    const novaEmpresa = await Empresa.create({
      nome_fantasia,
      cnpj
    });

    res.status(201).json({
      success: true,
      data: novaEmpresa,
      message: 'Empresa criada com sucesso'
    });
  } catch (error) {
    if (error.message.includes('duplicate key')) {
      res.status(400).json({
        success: false,
        error: 'CNPJ já cadastrado'
      });
    } else {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
};

const updateEmpresa = async (req, res) => {
  try {
    const { nome_fantasia, cnpj } = req.body;
    
    const empresaAtualizada = await Empresa.update(req.params.id, {
      nome_fantasia,
      cnpj
    });

    if (empresaAtualizada) {
      res.status(200).json({
        success: true,
        data: empresaAtualizada,
        message: 'Empresa atualizada com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Empresa não encontrada'
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const deleteEmpresa = async (req, res) => {
  try {
    const empresaDeletada = await Empresa.delete(req.params.id);
    if (empresaDeletada) {
      res.status(200).json({
        success: true,
        data: empresaDeletada,
        message: 'Empresa deletada com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Empresa não encontrada'
      });
    }
  } catch (error) {
    if (error.message.includes('foreign key')) {
      res.status(400).json({
        success: false,
        error: 'Não é possível deletar empresa que possui usuários ou produtos vinculados'
      });
    } else {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = {
  getAllEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa
};
