// middleware/autenticacao.js

/**
 * Middleware de autenticação para verificar se o usuário está logado
 */
const verificarAutenticacao = (req, res, next) => {
  // Verificar se existe sessão e usuário logado
  if (!req.session || !req.session.usuario) {
    console.log('❌ Acesso negado - Usuário não autenticado');
    
    // Se for uma requisição de API, retornar JSON
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
        redirect: '/login'
      });
    }
    
    // Se for uma página, redirecionar para login
    return res.redirect('/login');
  }

  // Verificar se o usuário tem dados válidos na sessão
  if (!req.session.usuario.id_empresa || !req.session.usuario.id_usuario) {
    console.log('❌ Sessão inválida - Dados do usuário incompletos');
    
    // Destruir sessão inválida
    req.session.destroy((err) => {
      if (err) {
        console.error('Erro ao destruir sessão inválida:', err);
      }
    });
    
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({
        success: false,
        error: 'Sessão inválida',
        redirect: '/login'
      });
    }
    
    return res.redirect('/login');
  }

  // Log de acesso autorizado
  console.log(`✅ Acesso autorizado - ${req.session.usuario.nome} (${req.session.usuario.empresa_nome}) acessando ${req.path}`);
  
  // Adicionar dados do usuário ao request para facilitar acesso
  req.usuario = req.session.usuario;
  req.id_empresa = req.session.usuario.id_empresa;
  
  next();
};

/**
 * Middleware específico para APIs que adiciona informações da empresa na resposta
 */
const verificarAutenticacaoAPI = (req, res, next) => {
  verificarAutenticacao(req, res, () => {
    // Interceptar res.json para adicionar informações da empresa
    const originalJson = res.json;
    res.json = function(data) {
      // Adicionar informações da empresa na resposta
      if (data && typeof data === 'object') {
        data.empresa_info = {
          id_empresa: req.session.usuario.id_empresa,
          nome_empresa: req.session.usuario.empresa_nome,
          usuario_logado: req.session.usuario.nome
        };
      }
      return originalJson.call(this, data);
    };
    
    next();
  });
};

/**
 * Middleware para verificar nível de acesso (admin, gerente, usuario)
 */
const verificarNivelAcesso = (niveisPermitidos) => {
  return (req, res, next) => {
    verificarAutenticacao(req, res, () => {
      const nivelUsuario = req.session.usuario.nivel_acesso || 'usuario';
      
      if (!niveisPermitidos.includes(nivelUsuario)) {
        console.log(`❌ Acesso negado - Nível insuficiente: ${nivelUsuario} (requerido: ${niveisPermitidos.join(', ')})`);
        
        if (req.path.startsWith('/api/')) {
          return res.status(403).json({
            success: false,
            error: 'Nível de acesso insuficiente',
            nivel_requerido: niveisPermitidos,
            nivel_atual: nivelUsuario
          });
        }
        
        return res.status(403).render('pages/error', {
          pageTitle: 'Acesso Negado - PCR Labor',
          error: 'Você não tem permissão para acessar esta página'
        });
      }
      
      next();
    });
  };
};

module.exports = {
  verificarAutenticacao,
  verificarAutenticacaoAPI,
  verificarNivelAcesso
};
