const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('view cache', false); // Desabilitar cache do EJS

// Middleware para processar JSON e URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração de sessão
app.use(session({
  secret: 'pcr-labor-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true apenas em HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Serve arquivos estáticos
app.use('/css', express.static(path.join(__dirname, 'views/css')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Rotas
const rotasPrincipais = require('./routes/rotasPrincipais');
const rotasPaginas = require('./routes/rotasPaginas');
const rotasProdutos = require('./routes/rotasProdutos');
const rotasVendas = require('./routes/rotasVendas');
const rotasEmpresas = require('./routes/rotasEmpresas');
const rotasUsuarios = require('./routes/rotasUsuarios');
const rotasPedidos = require('./routes/rotasPedidos');
const rotasTarefas = require('./routes/rotasTarefas');
const rotasFornecedores = require('./routes/rotasFornecedores');
const rotasPlataformas = require('./routes/rotasPlataformas');
const rotasEmails = require('./routes/rotasEmails');
const rotasAPI = require('./routes/rotasAPI');

app.use('/', rotasPaginas); // Rotas de páginas primeiro
app.use('/', rotasPrincipais);
app.use('/api', rotasAPI); // Rotas da API principal
app.use('/api/produtos', rotasProdutos);
app.use('/api/vendas', rotasVendas);
app.use('/api/empresas', rotasEmpresas);
app.use('/api/usuarios', rotasUsuarios);
app.use('/api/pedidos', rotasPedidos);
app.use('/api/tarefas', rotasTarefas);
app.use('/api/fornecedores', rotasFornecedores);
app.use('/api/plataformas', rotasPlataformas);
app.use('/api/emails', rotasEmails);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
