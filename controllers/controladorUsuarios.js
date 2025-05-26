// controllers/usuarioController.js

const Usuario = require('../models/modeloUsuarios');
const Empresa = require('../models/modeloEmpresa');
const bcrypt = require('bcrypt');

// Renderizar página de perfil
const renderPerfil = async (req, res) => {
  try {
    console.log('👤 Carregando página de perfil...');

    // Simular usuário logado (em produção viria da sessão)
    const userId = 1;
    let usuario = null;
    let metodosPagamento = [];

    try {
      // Buscar dados do usuário
      usuario = await Usuario.getById(userId);
      metodosPagamento = await Usuario.getMetodosPagamento(userId);

      console.log('✅ Dados do usuário carregados do banco');
    } catch (dbError) {
      console.log('⚠️ Banco não disponível, usando dados de demonstração:', dbError.message);

      // Dados de demonstração
      usuario = {
        id_usuario: 1,
        nome: 'Administrador PCR',
        email: 'admin@pcrlabor.com',
        telefone: '+55 11 99999-9999',
        cargo: 'Administrador',
        empresa_nome: 'PCR Labor',
        empresa_cnpj: '12.345.678/0001-90',
        avatar: '/assets/avatar-default.png',
        created_at: new Date('2024-01-01')
      };

      metodosPagamento = [
        {
          id_metodo: 1,
          tipo: 'boleto',
          descricao: 'Boleto Bancário',
          dados_pagamento: JSON.stringify({
            banco: 'Banco do Brasil',
            agencia: '1234-5',
            conta: '67890-1'
          }),
          ativo: true
        },
        {
          id_metodo: 2,
          tipo: 'transferencia',
          descricao: 'Transferência Bancária',
          dados_pagamento: JSON.stringify({
            banco: 'Itaú',
            agencia: '0987',
            conta: '12345-6',
            pix: 'admin@pcrlabor.com'
          }),
          ativo: true
        },
        {
          id_metodo: 3,
          tipo: 'link',
          descricao: 'Link de Pagamento',
          dados_pagamento: JSON.stringify({
            gateway: 'PagSeguro',
            link: 'https://pagseguro.uol.com.br/checkout/v2/payment.html?code=ABC123'
          }),
          ativo: false
        }
      ];
    }

    // Processar dados de pagamento
    const metodosPagamentoProcessados = metodosPagamento.map(metodo => {
      let dadosPagamento = {};
      try {
        dadosPagamento = typeof metodo.dados_pagamento === 'string'
          ? JSON.parse(metodo.dados_pagamento)
          : metodo.dados_pagamento;
      } catch (e) {
        dadosPagamento = {};
      }

      return {
        ...metodo,
        dados_pagamento: dadosPagamento
      };
    });

    // Estatísticas do usuário
    const stats = {
      tempoNaEmpresa: usuario.created_at ? Math.floor((new Date() - new Date(usuario.created_at)) / (1000 * 60 * 60 * 24)) : 0,
      metodosPagamentoAtivos: metodosPagamentoProcessados.filter(m => m.ativo).length,
      ultimoLogin: new Date().toLocaleDateString('pt-BR'),
      sessaoAtiva: true
    };

    res.render('pages/perfil', {
      pageTitle: 'Perfil - PCR Labor',
      currentPage: 'perfil',
      usuario,
      metodosPagamento: metodosPagamentoProcessados,
      stats
    });
  } catch (error) {
    console.error('❌ Erro ao carregar perfil:', error);
    res.status(500).render('pages/error', {
      pageTitle: 'Erro - PCR Labor',
      error: 'Erro ao carregar perfil do usuário'
    });
  }
};

// Renderizar página de cadastro
const renderCadastro = async (req, res) => {
  try {
    console.log('📝 Carregando página de cadastro...');

    res.render('pages/cadastro', {
      pageTitle: 'Cadastro - PCR Labor',
      currentPage: 'cadastro'
    });
  } catch (error) {
    console.error('❌ Erro ao carregar página de cadastro:', error);
    res.status(500).render('pages/error', {
      pageTitle: 'Erro - PCR Labor',
      error: 'Erro ao carregar página de cadastro'
    });
  }
};

// Processar cadastro
const processarCadastro = async (req, res) => {
  try {
    console.log('📝 Processando cadastro de novo usuário e empresa...');

    const { nome, email, senha, confirmarSenha, nome_empresa, cnpj } = req.body;

    // Validações
    if (!nome || !email || !senha || !nome_empresa || !cnpj) {
      return res.render('pages/cadastro', {
        pageTitle: 'Cadastro - PCR Labor',
        currentPage: 'cadastro',
        error: 'Todos os campos obrigatórios devem ser preenchidos'
      });
    }

    if (senha !== confirmarSenha) {
      return res.render('pages/cadastro', {
        pageTitle: 'Cadastro - PCR Labor',
        currentPage: 'cadastro',
        error: 'As senhas não coincidem'
      });
    }

    if (senha.length < 6) {
      return res.render('pages/cadastro', {
        pageTitle: 'Cadastro - PCR Labor',
        currentPage: 'cadastro',
        error: 'A senha deve ter pelo menos 6 caracteres'
      });
    }

    // Verificar se email já existe
    try {
      const usuarioExistente = await Usuario.getByEmail(email);
      if (usuarioExistente) {
        return res.render('pages/cadastro', {
          pageTitle: 'Cadastro - PCR Labor',
          currentPage: 'cadastro',
          error: 'Este email já está cadastrado'
        });
      }
    } catch (error) {
      // Se der erro na busca, continua (pode ser que o usuário não existe)
    }

    // Primeiro, criar a empresa
    console.log('🏢 Criando nova empresa:', nome_empresa);
    const novaEmpresa = await Empresa.create({
      nome_fantasia: nome_empresa,
      cnpj: cnpj
    });

    console.log('✅ Empresa criada com ID:', novaEmpresa.id_empresa);

    // Depois, criar o usuário vinculado à empresa
    console.log('👤 Criando usuário para a empresa');
    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha,
      id_empresa: novaEmpresa.id_empresa
    });

    console.log('✅ Usuário criado com sucesso:', novoUsuario.email);
    console.log('🎉 Cadastro completo - Empresa e usuário criados');

    // Redirecionar para login com mensagem de sucesso
    res.render('pages/login', {
      pageTitle: 'Login - PCR Labor',
      currentPage: 'login',
      success: `Conta e empresa criadas com sucesso! Faça login para continuar.`
    });

  } catch (error) {
    console.error('❌ Erro ao processar cadastro:', error);

    let errorMessage = 'Erro interno do servidor';
    if (error.message.includes('duplicate key')) {
      if (error.message.includes('cnpj')) {
        errorMessage = 'Este CNPJ já está cadastrado';
      } else {
        errorMessage = 'Este email já está cadastrado';
      }
    }

    res.render('pages/cadastro', {
      pageTitle: 'Cadastro - PCR Labor',
      currentPage: 'cadastro',
      error: errorMessage
    });
  }
};

// Processar login
const processarLogin = async (req, res) => {
  try {
    console.log('🔐 Processando login...');

    const { email, senha } = req.body;

    // Validações básicas
    if (!email || !senha) {
      return res.render('pages/login', {
        pageTitle: 'Login - PCR Labor',
        currentPage: 'login',
        error: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário no banco
    console.log('🔍 Buscando usuário:', email);
    const usuario = await Usuario.getByEmail(email);

    if (!usuario) {
      console.log('❌ Usuário não encontrado');
      return res.render('pages/login', {
        pageTitle: 'Login - PCR Labor',
        currentPage: 'login',
        error: 'Email ou senha incorretos'
      });
    }

    // Verificar se usuário está ativo
    if (usuario.ativo === false) {
      console.log('❌ Usuário inativo');
      return res.render('pages/login', {
        pageTitle: 'Login - PCR Labor',
        currentPage: 'login',
        error: 'Conta desativada. Entre em contato com o administrador.'
      });
    }

    // Verificar senha
    console.log('🔑 Verificando senha...');
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      console.log('❌ Senha incorreta');
      return res.render('pages/login', {
        pageTitle: 'Login - PCR Labor',
        currentPage: 'login',
        error: 'Email ou senha incorretos'
      });
    }

    // Atualizar último login
    try {
      await Usuario.updateUltimoLogin(usuario.id_usuario);
    } catch (error) {
      console.log('⚠️ Erro ao atualizar último login:', error.message);
    }

    console.log('✅ Login realizado com sucesso para:', usuario.nome);
    console.log('🏢 Empresa:', usuario.empresa_nome || 'N/A');

    // Salvar dados do usuário na sessão
    req.session.usuario = {
      id_usuario: usuario.id_usuario,
      nome: usuario.nome,
      email: usuario.email,
      id_empresa: usuario.id_empresa,
      empresa_nome: usuario.empresa_nome,
      nivel_acesso: usuario.nivel_acesso || 'usuario',
      ultimo_login: new Date()
    };

    console.log('💾 Sessão criada para usuário:', req.session.usuario.nome);
    console.log('🏢 Empresa na sessão:', req.session.usuario.empresa_nome);

    res.redirect('/dashboard');

  } catch (error) {
    console.error('❌ Erro ao processar login:', error);
    res.render('pages/login', {
      pageTitle: 'Login - PCR Labor',
      currentPage: 'login',
      error: 'Erro interno do servidor. Tente novamente.'
    });
  }
};

// Processar logout
const processarLogout = (req, res) => {
  try {
    console.log('🚪 Processando logout...');

    if (req.session.usuario) {
      console.log(`👋 Logout do usuário: ${req.session.usuario.nome}`);
    }

    // Destruir sessão
    req.session.destroy((err) => {
      if (err) {
        console.error('❌ Erro ao destruir sessão:', err);
        return res.status(500).json({ error: 'Erro ao fazer logout' });
      }

      console.log('✅ Sessão destruída com sucesso');
      res.redirect('/login');
    });

  } catch (error) {
    console.error('❌ Erro ao processar logout:', error);
    res.redirect('/login');
  }
};

// API endpoints
const getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.getAll();
    res.status(200).json({
      success: true,
      data: usuarios,
      message: 'Usuários recuperados com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuario.getById(req.params.id);
    if (usuario) {
      res.status(200).json({
        success: true,
        data: usuario,
        message: 'Usuário encontrado'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const createUsuario = async (req, res) => {
  try {
    const { nome, email, senha, id_empresa, telefone, cargo, avatar } = req.body;
    const newUsuario = await Usuario.create({ nome, email, senha, id_empresa, telefone, cargo, avatar });
    res.status(201).json({
      success: true,
      data: newUsuario,
      message: 'Usuário criado com sucesso'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const updateUsuario = async (req, res) => {
  try {
    const { nome, email, telefone, cargo, avatar } = req.body;
    const updatedUsuario = await Usuario.update(req.params.id, { nome, email, telefone, cargo, avatar });
    if (updatedUsuario) {
      res.status(200).json({
        success: true,
        data: updatedUsuario,
        message: 'Usuário atualizado com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { novaSenha } = req.body;
    const updated = await Usuario.updatePassword(req.params.id, novaSenha);
    if (updated) {
      res.status(200).json({
        success: true,
        message: 'Senha atualizada com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const deleteUsuario = async (req, res) => {
  try {
    const deleted = await Usuario.delete(req.params.id);
    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'Usuário deletado com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const getMetodosPagamento = async (req, res) => {
  try {
    const metodos = await Usuario.getMetodosPagamento(req.params.id);
    res.status(200).json({
      success: true,
      data: metodos,
      message: 'Métodos de pagamento recuperados com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

const addMetodoPagamento = async (req, res) => {
  try {
    const { tipo, descricao, dados_pagamento, ativo } = req.body;
    const newMetodo = await Usuario.addMetodoPagamento(req.params.id, { tipo, descricao, dados_pagamento, ativo });
    res.status(201).json({
      success: true,
      data: newMetodo,
      message: 'Método de pagamento adicionado com sucesso'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const updateMetodoPagamento = async (req, res) => {
  try {
    const { tipo, descricao, dados_pagamento, ativo } = req.body;
    const updatedMetodo = await Usuario.updateMetodoPagamento(req.params.metodoId, { tipo, descricao, dados_pagamento, ativo });
    if (updatedMetodo) {
      res.status(200).json({
        success: true,
        data: updatedMetodo,
        message: 'Método de pagamento atualizado com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Método de pagamento não encontrado'
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

const deleteMetodoPagamento = async (req, res) => {
  try {
    const deleted = await Usuario.deleteMetodoPagamento(req.params.metodoId);
    if (deleted) {
      res.status(200).json({
        success: true,
        message: 'Método de pagamento deletado com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Método de pagamento não encontrado'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  renderPerfil,
  renderCadastro,
  processarCadastro,
  processarLogin,
  processarLogout,
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  updatePassword,
  deleteUsuario,
  getMetodosPagamento,
  addMetodoPagamento,
  updateMetodoPagamento,
  deleteMetodoPagamento
};
