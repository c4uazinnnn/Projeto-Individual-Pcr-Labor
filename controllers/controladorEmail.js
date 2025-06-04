// controllers/controladorEmail.js

const Email = require('../models/modeloEmail');
const Usuario = require('../models/modeloUsuarios');

// Renderizar página de email
const renderEmail = async (req, res) => {
  try {
    console.log('📧 Carregando página de email...');

    const id_empresa = req.id_empresa;
    const usuario = req.usuario;

    console.log(`📧 Email para: ${usuario.nome} (${usuario.empresa_nome})`);

    let emails = [];
    let estatisticas = {};
    let usuarios = [];

    try {
      // Buscar dados FILTRADOS POR EMPRESA
      const [emailsResult, estatisticasResult, usuariosResult] = await Promise.all([
        Email.getCaixaEntrada(usuario.id_usuario, id_empresa).catch(() => []),
        Email.getEstatisticas(usuario.id_usuario, id_empresa).catch(() => ({})),
        Usuario.getByEmpresa(id_empresa).catch(() => [])
      ]);

      emails = emailsResult;
      estatisticas = estatisticasResult;
      usuarios = usuariosResult;

      console.log('✅ Dados do email carregados do banco');
      console.log(`📊 Emails: ${emails.length}, Não lidos: ${estatisticas.nao_lidos || 0}`);

      // Simular emails automáticos se não houver emails
      if (emails.length === 0) {
        console.log('📧 Simulando emails automáticos...');
        await Email.simularEmailsAutomaticos(id_empresa);
        emails = await Email.getCaixaEntrada(usuario.id_usuario, id_empresa);
        estatisticas = await Email.getEstatisticas(usuario.id_usuario, id_empresa);
      }

    } catch (dbError) {
      console.log('⚠️ Banco não disponível, usando dados de demonstração:', dbError.message);
      
      // Dados de demonstração
      emails = [
        {
          id_email: 1,
          assunto: 'Relatório Diário de Vendas',
          corpo: 'Seu relatório diário de vendas está pronto. Vendas hoje: R$ 2.450,00.',
          remetente_nome: 'Sistema PCR Lab',
          remetente_email: 'sistema@pcrlab.com',
          created_at: new Date(),
          lido: false,
          prioridade: 'normal',
          categoria: 'relatorio'
        },
        {
          id_email: 2,
          assunto: 'Alerta: Estoque Baixo',
          corpo: 'Kit PCR COVID-19 está com estoque baixo (5 unidades).',
          remetente_nome: 'Sistema de Alertas',
          remetente_email: 'alertas@pcrlab.com',
          created_at: new Date(Date.now() - 3600000),
          lido: false,
          prioridade: 'alta',
          categoria: 'alerta'
        }
      ];

      estatisticas = {
        total: 2,
        nao_lidos: 2,
        enviados: 0,
        recebidos: 2,
        urgentes: 1
      };

      usuarios = [
        { id_usuario: usuario.id_usuario, nome: usuario.nome, email: usuario.email }
      ];
    }

    res.render('pages/email', {
      pageTitle: `Email - ${usuario.empresa_nome}`,
      currentPage: 'email',
      emails,
      estatisticas,
      usuarios,
      usuario
    });

  } catch (error) {
    console.error('❌ Erro ao carregar página de email:', error);
    res.status(500).render('pages/error', {
      pageTitle: 'Erro - PCR Labor',
      error: 'Erro ao carregar sistema de email'
    });
  }
};

// API endpoints
const getAllEmails = async (req, res) => {
  try {
    const id_empresa = req.id_empresa;
    const id_usuario = req.usuario.id_usuario;

    console.log(`📧 API Email - Buscando para empresa ID: ${id_empresa}, usuário ID: ${id_usuario}`);

    const emails = await Email.getCaixaEntrada(id_usuario, id_empresa);

    console.log(`✅ API Email - Encontrados: ${emails.length} emails`);

    res.status(200).json({
      success: true,
      data: emails,
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
    const email = await Email.getById(req.params.id);
    if (email) {
      // Marcar como lido
      await Email.marcarComoLido(req.params.id);
      
      res.status(200).json({
        success: true,
        data: email,
        message: 'Email encontrado'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Email não encontrado'
      });
    }
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
    const id_remetente = req.usuario.id_usuario;
    const { id_destinatario, email_destinatario, assunto, corpo, prioridade, categoria } = req.body;

    console.log('📧 Criando email:', { assunto, id_destinatario, email_destinatario });

    // Validações
    if (!assunto || !corpo) {
      return res.status(400).json({
        success: false,
        error: 'Assunto e corpo são obrigatórios'
      });
    }

    if (!id_destinatario && !email_destinatario) {
      return res.status(400).json({
        success: false,
        error: 'Destinatário é obrigatório'
      });
    }

    const newEmail = await Email.create({
      id_empresa,
      id_remetente,
      id_destinatario,
      email_destinatario,
      assunto,
      corpo,
      prioridade,
      categoria
    });

    console.log('✅ Email criado com sucesso:', newEmail);

    res.status(201).json({
      success: true,
      data: newEmail,
      message: 'Email enviado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao criar email:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const marcarComoLido = async (req, res) => {
  try {
    const email = await Email.marcarComoLido(req.params.id);
    if (email) {
      res.status(200).json({
        success: true,
        data: email,
        message: 'Email marcado como lido'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Email não encontrado'
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const deleteEmail = async (req, res) => {
  try {
    const deleted = await Email.delete(req.params.id);
    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'Email deletado com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Email não encontrado'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getEstatisticas = async (req, res) => {
  try {
    const id_empresa = req.id_empresa;
    const id_usuario = req.usuario.id_usuario;

    const estatisticas = await Email.getEstatisticas(id_usuario, id_empresa);

    res.status(200).json({
      success: true,
      data: estatisticas,
      message: 'Estatísticas recuperadas com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const buscarEmails = async (req, res) => {
  try {
    const id_empresa = req.id_empresa;
    const filtros = req.query;

    console.log('🔍 Buscando emails com filtros:', filtros);

    const emails = await Email.buscarPorFiltros(filtros, id_empresa);

    res.status(200).json({
      success: true,
      data: emails,
      message: `${emails.length} emails encontrados`
    });
  } catch (error) {
    console.error('❌ Erro ao buscar emails:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  renderEmail,
  getAllEmails,
  getEmailById,
  createEmail,
  marcarComoLido,
  deleteEmail,
  getEstatisticas,
  buscarEmails
};
