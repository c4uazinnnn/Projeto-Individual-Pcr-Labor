// controllers/controladorPlataformas.js

const Plataforma = require('../models/modeloPlataformas');

// Renderizar página de plataformas
const renderPlataformas = async (req, res) => {
  try {
    const id_empresa = req.id_empresa;
    const usuario = req.usuario;
    
    console.log(`🌐 Renderizando página de plataformas para empresa ${usuario.empresa_nome}`);
    
    // Buscar dados das plataformas com vendas
    const vendasPorPlataforma = await Plataforma.getVendasPorPlataforma(id_empresa);
    
    console.log(`✅ ${vendasPorPlataforma.length} plataformas encontradas`);
    
    res.render('pages/plataformas', {
      pageTitle: `Plataformas - ${usuario.empresa_nome}`,
      currentPage: 'plataformas',
      usuario,
      vendasPorPlataforma
    });
  } catch (error) {
    console.error('❌ Erro ao renderizar página de plataformas:', error);
    res.status(500).render('pages/error', {
      pageTitle: 'Erro - PCR Labor',
      error: 'Erro ao carregar página de plataformas'
    });
  }
};

// API endpoints
const getAllPlataformas = async (req, res) => {
  try {
    const plataformas = await Plataforma.getAll();
    
    res.status(200).json({
      success: true,
      data: plataformas,
      message: 'Plataformas recuperadas com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao buscar plataformas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getPlataformaById = async (req, res) => {
  try {
    const { id } = req.params;
    const plataforma = await Plataforma.getById(id);
    
    if (!plataforma) {
      return res.status(404).json({
        success: false,
        error: 'Plataforma não encontrada'
      });
    }
    
    res.status(200).json({
      success: true,
      data: plataforma,
      message: 'Plataforma recuperada com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const createPlataforma = async (req, res) => {
  try {
    const { nome } = req.body;

    // Validações
    if (!nome) {
      return res.status(400).json({
        success: false,
        error: 'Nome da plataforma é obrigatório'
      });
    }

    const plataformaData = { nome };
    const plataforma = await Plataforma.create(plataformaData);

    console.log(`✅ Plataforma criada: ${plataforma.nome} (ID: ${plataforma.id_plataforma})`);

    res.status(201).json({
      success: true,
      data: plataforma,
      message: 'Plataforma criada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar plataforma:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const updatePlataforma = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;

    // Verificar se a plataforma existe
    const plataforma = await Plataforma.getById(id);
    if (!plataforma) {
      return res.status(404).json({
        success: false,
        error: 'Plataforma não encontrada'
      });
    }

    const plataformaData = { nome };
    const updatedPlataforma = await Plataforma.update(id, plataformaData);

    res.status(200).json({
      success: true,
      data: updatedPlataforma,
      message: 'Plataforma atualizada com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const deletePlataforma = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a plataforma existe
    const plataforma = await Plataforma.getById(id);
    if (!plataforma) {
      return res.status(404).json({
        success: false,
        error: 'Plataforma não encontrada'
      });
    }

    await Plataforma.delete(id);

    res.status(200).json({
      success: true,
      message: 'Plataforma deletada com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Buscar vendas por plataforma
const getVendasPorPlataforma = async (req, res) => {
  try {
    const id_empresa = req.id_empresa;
    const vendas = await Plataforma.getVendasPorPlataforma(id_empresa);
    
    res.status(200).json({
      success: true,
      data: vendas,
      message: 'Vendas por plataforma recuperadas com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao buscar vendas por plataforma:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Sincronizar plataforma específica
const sincronizarPlataforma = async (req, res) => {
  try {
    const { id } = req.params;
    const plataforma = await Plataforma.getById(id);
    
    if (!plataforma) {
      return res.status(404).json({
        success: false,
        error: 'Plataforma não encontrada'
      });
    }
    
    // Simular sincronização
    console.log(`🔄 Sincronizando plataforma: ${plataforma.nome}`);
    
    // Aqui seria implementada a lógica real de sincronização
    // Por exemplo, conectar com APIs das plataformas
    
    res.status(200).json({
      success: true,
      message: `Plataforma ${plataforma.nome} sincronizada com sucesso`,
      data: {
        novas_vendas: Math.floor(Math.random() * 10),
        produtos_atualizados: Math.floor(Math.random() * 5),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Erro ao sincronizar plataforma:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  renderPlataformas,
  getAllPlataformas,
  getPlataformaById,
  createPlataforma,
  updatePlataforma,
  deletePlataforma,
  getVendasPorPlataforma,
  sincronizarPlataforma
};
