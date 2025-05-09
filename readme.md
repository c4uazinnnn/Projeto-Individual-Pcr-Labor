<h1>Pcr Labor</h1>
<p>O projeto consiste no desenvolvimento de uma aplicação web para a empresa PCR Labor, com o objetivo de melhorar a integração entre plataformas de e-commerce (como Mercado Livre e Shopee). A aplicação vai consolidar informações de vendas, sugerir quantidades ideais de compra de produtos e fornecer relatórios de desempenho para facilitar o gerenciamento do estoque e a tomada de decisões comerciais.
</p>

<h2> Funcionalidades</h2>
<ul>
  <li>Flitro de vendas organizadas por categorias, por períodos específicos </li>
  <li>Centralizar informacoes de vendas e estoque</li>
  <li>Autenticação de usuários com Supabase</li>
</ul>

<h2> Tecnologias Utilizadas</h2>
<ul>
  <li><strong>Frontend:</strong> HTML, CSS, JavaScript</li>
  <li><strong>Backend:</strong> Node.js (Express)</li>
  <li><strong>Banco de Dados:</strong> PostgreSQL (via <a href="https://supabase.io" target="_blank">Supabase</a>)</li>
  <li><strong>Hospedagem/Serviços:</strong> Supabase Auth e Supabase DB</li>
</ul>

<h2>Estrutura de Pastas</h2>

<pre><code>Projeto-Individual/
├── assets/              # Arquivos estáticos como imagens, CSS, JS
├── config/              # Configurações da aplicação
├── controllers/         # Controladores da aplicação
├── documentos/          # Documentação adicional ou arquivos auxiliares
├── models/              # Modelos de dados
├── node_modules/        # Dependências instaladas via npm
├── routes/              # Definições de rotas
├── scripts/             # Scripts auxiliares
├── services/            # Lógica de serviços (ex: comunicação com APIs)
├── tests/               # Testes automatizados
├── views/               # Templates da interface do usuário
├── .env                 # Variáveis de ambiente
├── .gitignore           # Arquivos e pastas ignorados pelo Git
├── jest.config.js       # Configuração do Jest para testes
├── package-lock.json    # Lockfile do npm
├── package.json         # Configurações e dependências do projeto
├── readme.md            # Documentação do projeto
├── rest.http            # Requisições HTTP para testes
└── server.js            # Arquivo principal do servidor
</code></pre>

<h2>Como Rodar o Projeto Localmente</h2>

<ol>
  <li><strong>Clone o repositório:</strong>
    <pre><code>git clone https://github.com/c4uazinnnn/Projeto-Individual-Pcr-Labor
cd Projeto Individual</code></pre>
  </li>

  <li><strong>Instale as dependências:</strong> Certifique-se de que você tem o Node.js instalado. Em seguida, execute:
    <pre><code>npm install</code></pre>
  </li>

  <li><strong>Configure as variáveis de ambiente:</strong> Crie um arquivo <code>.env</code> na raiz do projeto com os dados do seu banco Supabase, como no exemplo abaixo:
    <pre><code>DB_USER=seu_usuario
DB_HOST=seu_host
DB_DATABASE=seu_banco
DB_PASSWORD=sua_senha
DB_PORT=sua_porta
DB_SSL=true
PORT=3000</code></pre>
  </li>

  <li><strong>Execute o script de inicialização do banco de dados:</strong> Certifique-se de que o PostgreSQL está rodando e execute:
    <pre><code>node scripts/runSQLScript.js</code></pre>
  </li>

  <li><strong>Inicie o servidor:</strong>
    <pre><code>npm start</code></pre>
  </li>

  <li><strong>Acesse a aplicação:</strong>
    <pre><code>http://localhost:3000</code></pre>
  </li>

  <li><strong>Testes (opcional):</strong> Para rodar os testes:
    <pre><code>npm test</code></pre>
  </li>
</ol>
