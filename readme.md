<h1>PCR Labor</h1>
<p>O projeto consiste no desenvolvimento de uma aplicação web para a empresa PCR Labor, com o objetivo de melhorar a integração entre plataformas de e-commerce (como Mercado Livre e Shopee). A aplicação vai consolidar informações de vendas, sugerir quantidades ideais de compra de produtos e fornecer relatórios de desempenho para facilitar o gerenciamento do estoque e a tomada de decisões comerciais.
</p>

<h2>Funcionalidades</h2>
<ul>
  <li>Dashboard com métricas em tempo real</li>
  <li>Filtro de vendas organizadas por categorias e períodos específicos</li>
  <li>Centralizar informações de vendas e estoque</li>
  <li>Integração com Mercado Livre e Shopee</li>
  <li>Gestão de pedidos e fornecedores</li>
  <li>Relatórios e gráficos interativos</li>
  <li>Sistema de alertas de estoque baixo</li>
  <li>Autenticação de usuários</li>
</ul>

<h2>Tecnologias Utilizadas</h2>
<ul>
  <li><strong>Frontend:</strong> HTML, CSS, JavaScript, EJS, Chart.js</li>
  <li><strong>Backend:</strong> Node.js (Express)</li>
  <li><strong>Banco de Dados:</strong> PostgreSQL (via <a href="https://supabase.io" target="_blank">Supabase</a>)</li>
  <li><strong>Arquitetura:</strong> MVC (Model-View-Controller)</li>
  <li><strong>Hospedagem/Serviços:</strong> Supabase Auth e Supabase DB</li>
</ul>

<h2>Estrutura de Pastas</h2>

<pre><code>Projeto-Individual/
├── assets/              # Arquivos estáticos como imagens, CSS, JS
├── config/              # Configurações da aplicação
├── controllers/         # Controladores da aplicação (nomes em português)
│   ├── controladorDashboard.js
│   ├── controladorProdutos.js
│   ├── controladorVendas.js
│   ├── controladorPedidos.js
│   └── controladorUsuarios.js
├── documentos/          # Documentação adicional ou arquivos auxiliares
├── models/              # Modelos de dados (nomes em português)
│   ├── modeloProdutos.js
│   ├── modeloVendas.js
│   ├── modeloPedidos.js
│   ├── modeloUsuarios.js
│   ├── modeloPlataformas.js
│   └── modeloEmpresa.js
├── node_modules/        # Dependências instaladas via npm
├── routes/              # Definições de rotas (nomes em português)
│   ├── rotasPrincipais.js
│   ├── rotasPaginas.js
│   ├── rotasProdutos.js
│   └── rotasVendas.js
├── scripts/             # Scripts auxiliares
├── services/            # Lógica de serviços (nomes em português)
│   ├── servicoIntegracaoDados.js
│   └── servicoIntegracaoPlataformas.js
├── tests/               # Testes automatizados
├── views/               # Templates da interface do usuário
│   ├── pages/           # Páginas principais
│   ├── components/      # Componentes reutilizáveis (nomes em português)
│   └── css/             # Estilos (estilos.css)
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
    <pre><code># Modo produção
npm start

# Modo desenvolvimento (com nodemon)
npm run dev</code></pre>
  </li>

  <li><strong>Acesse a aplicação:</strong>
    <pre><code>http://localhost:3000

# Credenciais de login:
Email: admin@pcrlabor.com
Senha: admin123</code></pre>
  </li>


</ol>

<h2>Organização dos Arquivos</h2>
<p>O projeto foi organizado com nomes em português para facilitar a manutenção:</p>
<ul>
  <li><strong>Controllers:</strong> Todos os controladores têm nomes em português (ex: controladorDashboard.js)</li>
  <li><strong>Models:</strong> Todos os modelos têm nomes em português (ex: modeloProdutos.js)</li>
  <li><strong>Routes:</strong> Todas as rotas têm nomes em português (ex: rotasPaginas.js)</li>
  <li><strong>Services:</strong> Todos os serviços têm nomes em português (ex: servicoIntegracaoDados.js)</li>
  <li><strong>Components:</strong> Todos os componentes têm nomes em português (ex: cabecalho.ejs)</li>
</ul>
