# 🏥 PCR Labor - Sistema de Gestão Completo

## 📋 Sobre o Projeto

O **PCR Labor** é uma aplicação web completa desenvolvida para otimizar a gestão de vendas, estoque e pedidos da empresa PCR Labor. O sistema integra múltiplas plataformas de e-commerce (Mercado Livre, Shopee e vendas diretas) em uma interface unificada, proporcionando controle total sobre as operações comerciais.

### 🎯 Objetivos Principais

- **Centralização de Dados**: Unificar informações de vendas de todas as plataformas
- **Gestão Inteligente**: Controle automatizado de estoque e sugestões de compra
- **Análise de Performance**: Relatórios detalhados e métricas em tempo real
- **Otimização de Processos**: Automatização de tarefas repetitivas
- **Tomada de Decisão**: Dashboards interativos com insights estratégicos

## 🚀 Funcionalidades Principais

### 📊 Dashboard Executivo
- **Visão Geral Completa**: Métricas consolidadas de todas as operações
- **Gráficos Interativos**: Visualização de vendas, estoque, pedidos e plataformas
- **KPIs em Tempo Real**: Indicadores de performance atualizados automaticamente
- **Análise Comparativa**: Performance entre diferentes plataformas e períodos

### 💰 Gestão de Vendas
- **Histórico Completo**: Registro detalhado de todas as vendas
- **Filtros Avançados**: Por período, plataforma, produto e status
- **Métricas Detalhadas**: Valor total, ticket médio, quantidade vendida
- **Projeções**: Estimativas baseadas em dados históricos
- **Integração Multi-plataforma**: Shopee, Mercado Livre e vendas diretas

### 📦 Controle de Estoque
- **Monitoramento em Tempo Real**: Status atual de todos os produtos
- **Alertas Inteligentes**: Notificações para estoque baixo ou crítico
- **Categorização**: Organização por tipo de produto e prioridade
- **Histórico de Movimentação**: Rastreamento completo de entradas e saídas
- **Relatórios de Performance**: Análise de giro e rentabilidade

### 🛒 Gestão de Pedidos
- **Controle Completo**: Criação, aprovação e acompanhamento de pedidos
- **Status Dinâmico**: Pendente, aprovado, cancelado com atualizações automáticas
- **Filtros Inteligentes**: Por período, status, fornecedor e prioridade
- **Workflow Otimizado**: Processo simplificado de aprovação
- **Integração com Estoque**: Atualização automática após recebimento

### 🌐 Análise de Plataformas
- **Performance Individual**: Métricas específicas de cada plataforma
- **Comparativo de Vendas**: Análise lado a lado das performances
- **Sincronização**: Atualização automática de dados das APIs
- **Relatórios Customizados**: Insights específicos por canal de venda

### 👤 Perfil e Configurações
- **Gestão de Usuários**: Controle de acesso e permissões
- **Configurações Personalizadas**: Adaptação às necessidades específicas
- **Dados Financeiros**: Informações bancárias e métodos de pagamento
- **Preferências**: Customização da interface e notificações

### ✅ Sistema de Tarefas
- **Organização Kanban**: A fazer, fazendo, concluído
- **Persistência de Dados**: Tarefas salvas no banco de dados
- **Interface Intuitiva**: Drag-and-drop entre status
- **Sincronização**: Atualizações em tempo real entre páginas

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js**: Runtime JavaScript para servidor
- **Express.js**: Framework web minimalista e flexível
- **PostgreSQL**: Banco de dados relacional robusto
- **EJS**: Template engine para renderização server-side
- **bcrypt**: Criptografia de senhas
- **express-session**: Gerenciamento de sessões

### Frontend
- **HTML5**: Estrutura semântica moderna
- **CSS3**: Estilização avançada com Flexbox e Grid
- **JavaScript ES6+**: Funcionalidades interativas
- **Chart.js**: Gráficos e visualizações de dados
- **Design Responsivo**: Adaptação para todos os dispositivos

### Banco de Dados
- **PostgreSQL 14+**: Sistema de gerenciamento robusto
- **Estrutura Normalizada**: Relacionamentos otimizados
- **Índices de Performance**: Consultas rápidas e eficientes
- **Views Customizadas**: Relatórios pré-configurados
- **Triggers Automáticos**: Atualizações em tempo real

## 📁 Estrutura do Projeto

```
PCR-Labor/
├── 📁 config/              # Configurações do sistema
│   └── db.js              # Conexão com banco de dados
├── 📁 controllers/         # Controladores MVC
│   ├── controladorAuth.js # Autenticação
│   ├── controladorVendas.js # Gestão de vendas
│   └── ...
├── 📁 models/             # Modelos de dados
│   ├── modeloVendas.js    # Modelo de vendas
│   ├── modeloProdutos.js  # Modelo de produtos
│   └── ...
├── 📁 routes/             # Rotas da aplicação
│   ├── rotasAuth.js       # Rotas de autenticação
│   ├── rotasAPI.js        # API endpoints
│   └── ...
├── 📁 views/              # Templates EJS
│   ├── 📁 pages/          # Páginas principais
│   ├── 📁 components/     # Componentes reutilizáveis
│   └── 📁 layouts/        # Layouts base
├── 📁 public/             # Arquivos estáticos
│   ├── 📁 css/            # Estilos CSS
│   ├── 📁 js/             # Scripts JavaScript
│   └── 📁 images/         # Imagens e assets
├── 📁 scripts/            # Scripts de banco
│   ├── database-completo.sql # Estrutura completa
│   └── executar-database-completo.js # Executor
├── 📁 services/           # Serviços de negócio
└── 📁 documents/          # Documentação

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
