// controllers/controladorEmails.js

const Email = require('../models/modeloEmails');

// Renderizar página de emails
const renderEmails = async (req, res) => {
  try {
    const id_empresa = req.id_empresa;
    const usuario = req.usuario;
    
    console.log(`📧 Renderizando página de emails para empresa ${usuario.empresa_nome}`);
    
    res.render('pages/emails', {
      pageTitle: `Emails - ${usuario.empresa_nome}`,
      currentPage: 'emails',
      usuario
    });
  } catch (error) {
    console.error('❌ Erro ao renderizar página de emails:', error);
    res.status(500).render('pages/error', {
      pageTitle: 'Erro - PCR Labor',
      error: 'Erro ao carregar página de emails'
    });
  }
};

// API endpoints
const getAllEmails = async (req, res) => {
  try {
    const id_empresa = req.id_empresa;
    
    // Buscar emails e estatísticas
    const [emails, stats] = await Promise.all([
      Email.getAll(id_empresa),
      Email.getEstatisticas(id_empresa)
    ]);
    
    // Formatar emails para o frontend
    const emailsFormatados = emails.map(email => ({
      id: email.id_email,
      remetente: email.email_remetente || 'Sistema',
      destinatario: email.email_destinatario,
      assunto: email.assunto,
      corpo: email.corpo,
      corpo_preview: email.corpo ? email.corpo.substring(0, 100) + '...' : '',
      categoria: email.categoria || 'GERAL',
      prioridade: email.prioridade || 'normal',
      lido: email.lido || false,
      data_envio: email.data_envio,
      data_recebimento: email.data_recebimento || email.created_at,
      status: email.status || 'RECEBIDO'
    }));
    
    res.status(200).json({
      success: true,
      data: {
        emails: emailsFormatados,
        total: parseInt(stats.total) || 0,
        lidos: parseInt(stats.lidos) || 0,
        nao_lidos: parseInt(stats.nao_lidos) || 0,
        spam: parseInt(stats.spam) || 0,
        alta_prioridade: parseInt(stats.alta_prioridade) || 0
      },
      message: 'Emails recuperados com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao buscar emails:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getEmailById = async (req, res) => {
  try {
    const { id } = req.params;
    const email = await Email.getById(id);
    
    if (!email) {
      return res.status(404).json({
        success: false,
        error: 'Email não encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: email,
      message: 'Email recuperado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const createEmail = async (req, res) => {
  try {
    const id_empresa = req.id_empresa;
    const {
      email_destinatario,
      email_remetente,
      assunto,
      corpo,
      categoria,
      prioridade
    } = req.body;

    // Validações
    if (!email_destinatario || !assunto || !corpo) {
      return res.status(400).json({
        success: false,
        error: 'Email destinatário, assunto e corpo são obrigatórios'
      });
    }

    const emailData = {
      id_empresa,
      email_destinatario,
      email_remetente: email_remetente || `${req.usuario.nome.toLowerCase().replace(' ', '.')}@pcrlabor.com`,
      assunto,
      corpo,
      categoria: categoria || 'GERAL',
      prioridade: prioridade || 'normal',
      data_envio: new Date(),
      data_recebimento: new Date()
    };

    const email = await Email.create(emailData);

    console.log(`✅ Email criado: ${email.assunto} para ${email.email_destinatario}`);

    res.status(201).json({
      success: true,
      data: email,
      message: 'Email enviado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar email:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const updateEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const emailData = req.body;

    // Verificar se o email existe
    const email = await Email.getById(id);
    if (!email) {
      return res.status(404).json({
        success: false,
        error: 'Email não encontrado'
      });
    }

    const updatedEmail = await Email.update(id, emailData);

    res.status(200).json({
      success: true,
      data: updatedEmail,
      message: 'Email atualizado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const deleteEmail = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o email existe
    const email = await Email.getById(id);
    if (!email) {
      return res.status(404).json({
        success: false,
        error: 'Email não encontrado'
      });
    }

    await Email.delete(id);

    res.status(200).json({
      success: true,
      message: 'Email deletado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Marcar email como lido
const marcarComoLido = async (req, res) => {
  try {
    const { id } = req.params;
    
    const email = await Email.marcarComoLido(id);
    
    if (!email) {
      return res.status(404).json({
        success: false,
        error: 'Email não encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: email,
      message: 'Email marcado como lido'
    });
  } catch (error) {
    console.error('❌ Erro ao marcar email como lido:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Marcar todos como lidos
const marcarTodosComoLidos = async (req, res) => {
  try {
    const id_empresa = req.id_empresa;
    
    const count = await Email.marcarTodosComoLidos(id_empresa);
    
    res.status(200).json({
      success: true,
      data: { emails_marcados: count },
      message: `${count} emails marcados como lidos`
    });
  } catch (error) {
    console.error('❌ Erro ao marcar todos como lidos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Sincronizar emails
const sincronizarEmails = async (req, res) => {
  try {
    const id_empresa = req.id_empresa;
    
    // Simular sincronização com plataformas externas
    console.log(`🔄 Sincronizando emails para empresa ${id_empresa}`);
    
    // Aqui seria implementada a lógica real de sincronização
    // Por exemplo, conectar com APIs de email, webhooks, etc.
    
    const novosEmails = Math.floor(Math.random() * 5) + 1;
    
    res.status(200).json({
      success: true,
      data: {
        novos_emails: novosEmails,
        timestamp: new Date().toISOString()
      },
      message: `Sincronização concluída: ${novosEmails} novos emails`
    });
  } catch (error) {
    console.error('❌ Erro ao sincronizar emails:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  renderEmails,
  getAllEmails,
  getEmailById,
  createEmail,
  updateEmail,
  deleteEmail,
  marcarComoLido,
  marcarTodosComoLidos,
  sincronizarEmails
};
