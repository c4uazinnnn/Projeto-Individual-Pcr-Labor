const express = require('express');
const app = express();
const PORT = 3000;

app.use('/css', express.static(__dirname + '/views/css'));

// Middleware para processar JSON
app.use(express.json());

// Serve arquivos estáticos da pasta "assets"
app.use('/assets', express.static('assets'));

// Rotas
const routes = require('./routes/index');
app.use('/', routes);

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
