// controllers/tarefaController.js

const Tarefa = require('../models/modeloTarefas');

// API endpoints
const getAllTarefas = async (req, res) => {
  try {
    const id_empresa = req.id_empresa; // Vem do middleware
    const id_usuario = req.usuario ? req.usuario.id_usuario : null;

    console.log(`📋 Buscando tarefas para empresa ID: ${id_empresa}, usuário ID: ${id_usuario}`);

    const tarefas = await Tarefa.getAll(id_usuario, id_empresa);

    console.log(`✅ Encontradas ${tarefas.length} tarefas para a empresa`);

    res.status(200).json({
      success: true,
      data: tarefas,
      message: 'Tarefas recuperadas com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao buscar tarefas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getTarefaById = async (req, res) => {
  try {
    const tarefa = await Tarefa.getById(req.params.id);
    if (tarefa) {
      res.status(200).json({
        success: true,
        data: tarefa,
        message: 'Tarefa encontrada'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada'
      });
    }
  } catch (error) {
    console.error('❌ Erro ao buscar tarefa:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const createTarefa = async (req, res) => {
  try {
    const { texto, prioridade, categoria, data_vencimento, observacoes } = req.body;
    
    // Validação básica
    if (!texto || texto.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Texto da tarefa é obrigatório'
      });
    }

    const newTarefa = await Tarefa.create({ 
      texto: texto.trim(), 
      prioridade, 
      categoria, 
      data_vencimento, 
      observacoes 
    });
    
    console.log(`✅ Nova tarefa criada: ${newTarefa.texto} (${newTarefa.prioridade})`);
    
    res.status(201).json({
      success: true,
      data: newTarefa,
      message: 'Tarefa criada com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar tarefa:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const updateTarefa = async (req, res) => {
  try {
    const { texto, prioridade, categoria, concluida, data_vencimento, observacoes } = req.body;
    
    const updatedTarefa = await Tarefa.update(req.params.id, { 
      texto, 
      prioridade, 
      categoria, 
      concluida, 
      data_vencimento, 
      observacoes 
    });
    
    if (updatedTarefa) {
      console.log(`✅ Tarefa atualizada: ${updatedTarefa.texto}`);
      res.status(200).json({
        success: true,
        data: updatedTarefa,
        message: 'Tarefa atualizada com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada'
      });
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar tarefa:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const deleteTarefa = async (req, res) => {
  try {
    const deleted = await Tarefa.delete(req.params.id);
    if (deleted) {
      console.log(`🗑️ Tarefa excluída: ${deleted.texto}`);
      res.status(200).json({
        success: true,
        message: 'Tarefa deletada com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada'
      });
    }
  } catch (error) {
    console.error('❌ Erro ao deletar tarefa:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const toggleTarefa = async (req, res) => {
  try {
    const tarefa = await Tarefa.toggleConcluida(req.params.id);
    if (tarefa) {
      const status = tarefa.concluida ? 'concluída' : 'reativada';
      console.log(`${tarefa.concluida ? '✅' : '🔄'} Tarefa ${status}: ${tarefa.texto}`);
      
      res.status(200).json({
        success: true,
        data: tarefa,
        message: `Tarefa ${status} com sucesso`
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Tarefa não encontrada'
      });
    }
  } catch (error) {
    console.error('❌ Erro ao alterar status da tarefa:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getPendentes = async (req, res) => {
  try {
    const tarefas = await Tarefa.getPendentes();
    res.status(200).json({
      success: true,
      data: tarefas,
      message: 'Tarefas pendentes recuperadas com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao buscar tarefas pendentes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getEstatisticas = async (req, res) => {
  try {
    const stats = await Tarefa.getEstatisticas();
    res.status(200).json({
      success: true,
      data: stats,
      message: 'Estatísticas recuperadas com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getAllTarefas,
  getTarefaById,
  createTarefa,
  updateTarefa,
  deleteTarefa,
  toggleTarefa,
  getPendentes,
  getEstatisticas
};
