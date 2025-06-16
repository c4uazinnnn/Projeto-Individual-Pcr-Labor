# Web Application Document - Projeto Individual - Módulo 2 - Inteli

## Pcr Labor

#### Cauã Pirilo Asquino

## Sumário

1. [Introdução](#c1)  
2. [Visão Geral da Aplicação Web](#c2)  
3. [Projeto Técnico da Aplicação Web](#c3)  
4. [Desenvolvimento da Aplicação Web](#c4)  
5. [Referências](#c5)  

<br>

## <a name="c1"></a>1. Introdução (Semana 01)

O projeto consiste no desenvolvimento de uma aplicação web para a empresa PCR Labor, com o objetivo de melhorar a integração entre plataformas de e-commerce (como Mercado Livre e Shopee). A aplicação vai consolidar informações de vendas, sugerir quantidades ideais de compra de produtos e fornecer relatórios de desempenho para facilitar o gerenciamento do estoque e a tomada de decisões comerciais.

---

## <a name="c2"></a>2. Visão Geral da Aplicação Web

### 2.1. Personas (Semana 01)

<div align="center">
  <sub></sub><br>
  <img src="assets/persona.png" width="100%"
  alt="  "><br>
  <sup>Fonte: Material produzido pelos autores, 2025</sup>
</div>

### 2.2. User Stories (Semana 01)

US01
Como gerente de operações, quero visualizar a quantidade de vendas por produto em tempo real, para que eu possa tomar decisões rápidas de reposição de estoque.

US02
Como gerente de operações, quero receber sugestões automáticas de compra baseadas no histórico de vendas, para que eu possa manter o estoque equilibrado.

US03
Como gerente de operações, quero consolidar as informações de vendas de múltiplas plataformas em um único painel, para que eu possa gerenciar os dados de forma mais eficiente.

Critério N – Negociável:
A US01 é negociável porque o gerente de operações pode escolher, por exemplo, se quer ver as vendas organizadas por categorias, por períodos específicos (últimos 7 dias, 30 dias) ou agrupadas por plataforma (Mercado Livre, Shopee). O formato e os filtros podem ser ajustados para melhor atender às necessidades do usuário sem alterar o objetivo principal da funcionalidade.

---

## <a name="c3"></a>3. Projeto da Aplicação Web

### 3.1. Modelagem do banco de dados  (Semana 3)

<div align="center">
  <sub></sub><br>
  <img src="assets/Modelo Relacional.png" width="100%"
  alt="  "><br>
  <sup>Fonte: Material produzido pelos autores, 2025</sup>
</div>


### Codigo SQL


```sql
-- Tabela de Empresas
CREATE TABLE IF NOT EXISTS Empresa (
    id_empresa SERIAL PRIMARY KEY,
    nome_fantasia VARCHAR(100) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Usuários (ligados à empresa)
CREATE TABLE IF NOT EXISTS Usuario (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    cargo VARCHAR(100),
    avatar VARCHAR(255),
    id_empresa INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE
);

-- Tabela de Plataformas (ex: Shopee, Mercado Livre)
CREATE TABLE IF NOT EXISTS Plataforma (
    id_plataforma SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Produtos (ligados à empresa)
CREATE TABLE IF NOT EXISTS Produto (
    id_produto SERIAL PRIMARY KEY,
    id_empresa INTEGER NOT NULL,
    nome VARCHAR(100) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    preco_base DECIMAL(10,2) DEFAULT 0,
    custo_frete DECIMAL(10,2) DEFAULT 0,
    estoque_atual INTEGER NOT NULL DEFAULT 0,
    estoque_minimo INTEGER DEFAULT 10,
    categoria VARCHAR(50),
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE
);

-- Tabela de Vendas
CREATE TABLE IF NOT EXISTS Venda (
    id_venda SERIAL PRIMARY KEY,
    id_produto INTEGER NOT NULL,
    id_plataforma INTEGER NOT NULL,
    id_empresa INTEGER,
    quantidade INTEGER NOT NULL,
    data DATE NOT NULL,
    valor_total DECIMAL(10,2),
    numero_venda VARCHAR(50),
    preco_unitario DECIMAL(10,2),
    desconto DECIMAL(10,2) DEFAULT 0,
    taxa_plataforma DECIMAL(5,2) DEFAULT 0,
    valor_liquido DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'confirmada',
    id_usuario INTEGER,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto) ON DELETE CASCADE,
    FOREIGN KEY (id_plataforma) REFERENCES Plataforma(id_plataforma) ON DELETE CASCADE,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE SET NULL
);

-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS Pedido (
    id_pedido SERIAL PRIMARY KEY,
    id_produto INTEGER NOT NULL,
    id_plataforma INTEGER NOT NULL,
    id_empresa INTEGER,
    id_fornecedor INTEGER,
    quantidade INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDENTE',
    data_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
    data_entrega DATE,
    valor_total DECIMAL(10,2),
    fornecedor VARCHAR(100),
    prioridade VARCHAR(20) DEFAULT 'media',
    observacoes TEXT,
    numero_pedido VARCHAR(50),
    aprovado_por INTEGER,
    data_aprovacao TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto) ON DELETE CASCADE,
    FOREIGN KEY (id_plataforma) REFERENCES Plataforma(id_plataforma) ON DELETE CASCADE,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE,
    FOREIGN KEY (id_fornecedor) REFERENCES Fornecedor(id_fornecedor) ON DELETE SET NULL,
    FOREIGN KEY (aprovado_por) REFERENCES Usuario(id_usuario) ON DELETE SET NULL
);

-- ===== TABELAS ADICIONAIS =====

-- Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS Fornecedor (
    id_fornecedor SERIAL PRIMARY KEY,
    id_empresa INTEGER NOT NULL,
    nome VARCHAR(200) NOT NULL,
    cnpj VARCHAR(18),
    email VARCHAR(100),
    telefone VARCHAR(20),
    endereco TEXT,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE
);

-- Tabela de Tarefas (Sistema Kanban)
CREATE TABLE IF NOT EXISTS Tarefa (
    id_tarefa SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    status VARCHAR(20) DEFAULT 'a_fazer',
    prioridade VARCHAR(20) DEFAULT 'media',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_conclusao TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE CASCADE
);

-- Tabela de Sugestões de Compra
CREATE TABLE IF NOT EXISTS SugestaoCompra (
    id_sugestao SERIAL PRIMARY KEY,
    id_produto INTEGER NOT NULL,
    quantidade_sugerida INTEGER NOT NULL,
    motivo TEXT,
    prioridade VARCHAR(20) DEFAULT 'media',
    status VARCHAR(20) DEFAULT 'pendente',
    data_sugestao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processado_em TIMESTAMP,
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto) ON DELETE CASCADE
);

-- Tabela de Emails
CREATE TABLE IF NOT EXISTS Email (
    id_email SERIAL PRIMARY KEY,
    id_empresa INTEGER NOT NULL,
    id_remetente INTEGER,
    id_destinatario INTEGER,
    email_destinatario VARCHAR(100),
    assunto VARCHAR(200) NOT NULL,
    corpo TEXT NOT NULL,
    prioridade VARCHAR(20) DEFAULT 'normal',
    categoria VARCHAR(50) DEFAULT 'geral',
    status VARCHAR(20) DEFAULT 'enviado',
    lido BOOLEAN DEFAULT false,
    data_leitura TIMESTAMP,
    anexos TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE,
    FOREIGN KEY (id_remetente) REFERENCES Usuario(id_usuario) ON DELETE SET NULL,
    FOREIGN KEY (id_destinatario) REFERENCES Usuario(id_usuario) ON DELETE SET NULL
);

-- Tabela de Movimentação de Estoque
CREATE TABLE IF NOT EXISTS MovimentacaoEstoque (
    id_movimentacao SERIAL PRIMARY KEY,
    id_produto INTEGER NOT NULL,
    id_empresa INTEGER NOT NULL,
    tipo_movimentacao VARCHAR(20) NOT NULL, -- 'entrada', 'saida', 'transferencia', 'full'
    quantidade INTEGER NOT NULL,
    quantidade_anterior INTEGER NOT NULL,
    quantidade_atual INTEGER NOT NULL,
    motivo VARCHAR(100),
    observacoes TEXT,
    id_usuario INTEGER,
    id_venda INTEGER,
    id_pedido INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto) ON DELETE CASCADE,
    FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario) ON DELETE SET NULL,
    FOREIGN KEY (id_venda) REFERENCES Venda(id_venda) ON DELETE SET NULL,
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido) ON DELETE SET NULL
);

```

### 3.1.1 BD e Models (Semana 5)

O sistema implementa modelos de dados seguindo o padrão MVC para organizar as operações do banco de dados.

#### **Models Implementados:**

**1. Modelo de Empresas (`modeloEmpresa.js`)**
- Gerencia dados das empresas
- Campos principais: id_empresa, nome_fantasia, cnpj

**2. Modelo de Usuários (`modeloUsuarios.js`)**
- Controla login e dados dos usuários
- Campos principais: id_usuario, nome, email, senha_hash, id_empresa
- Usa bcrypt para hash das senhas

**3. Modelo de Produtos (`modeloProdutos.js`)**
- Gerencia produtos e estoque
- Campos principais: id_produto, nome, sku, preco, estoque_atual, categoria
- Controla alertas de estoque baixo

**4. Modelo de Vendas (`modeloVendas.js`)**
- Registra vendas por plataforma
- Campos principais: id_venda, id_produto, quantidade, valor_total, data
- Calcula métricas básicas

**5. Modelo de Pedidos (`modeloPedidos.js`)**
- Controla pedidos de compra
- Campos principais: id_pedido, id_produto, quantidade, status, fornecedor
- Status: PENDENTE, APROVADO, ENTREGUE

**6. Modelo de Fornecedores (`modeloFornecedores.js`)**
- Dados dos fornecedores
- Campos principais: id_fornecedor, nome, cnpj, email, telefone

**7. Modelo de Plataformas (`modeloPlataformas.js`)**
- Plataformas de venda (Shopee, Mercado Livre)
- Campos principais: id_plataforma, nome

**8. Modelo de Tarefas (`modeloTarefas.js`)**
- Sistema de tarefas simples
- Campos principais: id_tarefa, titulo, status, id_usuario

**9. Modelo de Emails (`modeloEmail.js`)**
- Sistema básico de emails internos
- Campos principais: id_email, assunto, corpo, remetente, destinatario

#### **Características Técnicas:**
- Usa PostgreSQL com consultas SQL diretas
- Pool de conexões para performance
- Validação básica de dados
- Filtros por empresa (multi-tenant)

### 3.2. Arquitetura (Semana 5)

O sistema usa a arquitetura **MVC (Model-View-Controller)** com **Node.js**, **Express.js** e **PostgreSQL**.

#### **Estrutura da Aplicação:**

```
CLIENTE (Browser)
       ↓ HTTP
SERVIDOR EXPRESS.JS
├── Middleware (autenticação, sessões)
├── Rotas (rotasPaginas, rotasProdutos, etc.)
├── Controllers (Dashboard, Vendas, Produtos)
       ↓
MODELS (modeloProdutos, modeloVendas, etc.)
       ↓ SQL
BANCO POSTGRESQL
```

#### **Como Funciona:**

**1. Usuário acessa uma página**
- Browser faz requisição HTTP
- Express.js recebe a requisição

**2. Processamento**
- Middleware verifica autenticação
- Rota direciona para o Controller correto
- Controller processa a lógica

**3. Dados**
- Controller chama o Model necessário
- Model faz consulta SQL no PostgreSQL
- Dados retornam para o Controller

**4. Resposta**
- Controller renderiza a View (EJS)
- HTML é enviado para o browser
- Página é exibida para o usuário

#### **Componentes:**

**Frontend (View):**
- Templates EJS
- CSS customizado
- JavaScript para gráficos (Chart.js)

**Backend (Controller):**
- Express.js
- Sistema de sessões
- APIs REST básicas

**Dados (Model):**
- PostgreSQL (Supabase)
- Consultas SQL diretas
- Pool de conexões

### 3.3. Wireframes (Semana 03)

<div align="center">
  <sub></sub><br>
  <img src="assets/wireframe.png" width="100%"
  alt="  "><br>
  <sup>Fonte: Material produzido pelos autores, 2025</sup>
</div>


https://www.figma.com/design/bnIgHQ4EuyuMgQGea0ux2k/Pcr-Labor?node-id=17-193&t=MLZOHU1rxbvsHszI-1

Esse wireframe foi criado no Figma e pode ser acessado pelo link acima. Na primeira página, temos o login; na segunda página, temos um dashboard com informações de vendas, controle de estoque, gestor de tarefas, e-mails, estimativa de quantidade de compra de produtos, calendário e uma IA integrada. A partir do dashboard, o usuário consegue acessar outras seções do sistema, como a página de Vendas, que exibe gráficos com o histórico e projeção de vendas, além de permitir a seleção do período desejado. Também é possível acessar a aba de Estoque, onde são mostradas informações sobre a quantidade de produtos em estoque, número de compras realizadas e itens que ainda precisam ser enviados, tudo representado visualmente com gráficos. Na seção de Plataformas, o usuário visualiza o desempenho em diferentes canais de venda, como Shopee, Mercado Livre e a própria plataforma da PCR Labor, com gráficos comparativos. A área de Pedidos apresenta gráficos sobre o volume de pedidos, uma projeção de compras e o check-out dos pedidos em andamento. Por fim, a aba de Perfil concentra dados financeiros como valores a pagar, a receber e saldo total, além das opções de pagamento via boleto, transferência bancária ou link de pagamento. Todas as telas seguem o mesmo padrão visual e mantêm na lateral um painel fixo com tarefas, calendário e um campo para interação com a IA.


### 3.4. Guia de estilos (Semana 05)

O sistema segue um guia de estilos simples baseado nos wireframes criados.

#### **Cores Principais:**
- **Verde PCR**: `#018820` - Cor principal (botões, logo)
- **Verde Hover**: `#016a1a` - Para efeitos hover
- **Azul**: `#3b82f6` - Informações
- **Laranja**: `#f59e0b` - Alertas
- **Cinza**: `#333` - Textos
- **Fundo**: `#f8f9fa` - Fundo da aplicação

#### **Tipografia:**
- **Fonte**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Títulos**: 32px (H1), 24px (H2), 18px (H3)
- **Texto**: 14px normal
- **Pequeno**: 12px

#### **Componentes:**

**Botões:**
```css
.btn-primary {
  background: #018820;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
}
```

**Cards:**
```css
.summary-card {
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

#### **Layout:**
- **Header**: Fixo no topo, 70px altura
- **Sidebar**: Direita, 300px largura
- **Conteúdo**: Área central com padding 30px

#### **Responsividade:**
- **Mobile (< 768px)**: Sidebar oculta, cards em coluna
- **Desktop**: Layout completo com sidebar

#### **Elementos Visuais:**
- Emojis para ícones
- Chart.js para gráficos
- Hover effects simples
- Bordas arredondadas (6-8px)


### 3.5. Protótipo de alta fidelidade (Semana 05)

O protótipo foi criado no Figma seguindo os wireframes e o guia de estilos.

#### **Link do Protótipo:**
🔗 **[Protótipo no Figma](https://www.figma.com/design/bnIgHQ4EuyuMgQGea0ux2k/Pcr-Labor?node-id=17-193&t=MLZOHU1rxbvsHszI-1)**

#### **Telas Criadas:**

**1. Login**
- Campos de email e senha
- Logo PCR Labor
- Botão de acesso

**2. Dashboard**
- Header horizontal
- Sidebar com tarefas e calendário
- Cards de métricas
- Gráficos básicos

**3. Vendas**
- Tabela de vendas
- Gráficos simples
- Filtros por período

**4. Estoque**
- Lista de produtos
- Alertas de estoque baixo
- Status visual

**5. Pedidos**
- Lista por status
- Formulário de criação
- Dados do fornecedor

**6. Plataformas**
- Comparativo básico
- Métricas por canal

**7. Perfil**
- Dados do usuário
- Configurações básicas

#### **Características:**
- Cores do guia de estilos
- Layout responsivo básico
- Navegação entre telas
- Componentes reutilizáveis

O protótipo serviu como base para a implementação do sistema.

### 3.6. WebAPI e endpoints (Semana 05)

O sistema implementa APIs REST básicas para as principais funcionalidades.

#### **Base URL:** `http://localhost:3000/api`

#### **Principais Endpoints:**

**Dashboard:**
- `GET /api/dashboard-stats` - Estatísticas do dashboard

**Produtos:**
- `GET /api/produtos` - Lista produtos
- `POST /api/produtos` - Cria produto
- `PUT /api/produtos/:id` - Atualiza produto

**Vendas:**
- `GET /api/vendas` - Lista vendas
- `POST /api/vendas` - Registra venda

**Pedidos:**
- `GET /api/pedidos` - Lista pedidos
- `POST /api/pedidos` - Cria pedido
- `PUT /api/pedidos/:id/status` - Atualiza status

**Fornecedores:**
- `GET /api/fornecedores` - Lista fornecedores
- `POST /api/fornecedores` - Cadastra fornecedor

**Usuários:**
- `POST /login` - Login
- `POST /logout` - Logout
- `GET /api/usuarios/perfil` - Dados do usuário

**Tarefas:**
- `GET /api/tarefas` - Lista tarefas
- `POST /api/tarefas` - Cria tarefa

#### **Autenticação:**
- Sistema de sessões
- Middleware `verificarAutenticacao`
- Redirecionamento para login se não autenticado

#### **Formato de Resposta:**
```json
{
  "success": true,
  "data": [...],
  "message": "Operação realizada com sucesso"
}
```

#### **Códigos HTTP:**
- 200: Sucesso
- 401: Não autenticado
- 404: Não encontrado
- 500: Erro do servidor

### 3.7 Interface e Navegação (Semana 07)

O frontend foi desenvolvido seguindo os wireframes criados, com foco na usabilidade.

#### **Tecnologias:**
- **Templates**: EJS
- **CSS**: CSS3 customizado
- **JavaScript**: Vanilla JS + Chart.js
- **Ícones**: Emojis

#### **Layout:**

**Header (Topo):**
- Logo PCR Labor
- Menu de navegação horizontal
- Altura: 70px

**Área Principal:**
- Conteúdo central
- Padding: 30px
- Margem direita para sidebar

**Sidebar (Direita):**
- Largura: 300px
- Tarefas, calendário, IA
- Fixa na lateral

#### **Páginas Implementadas:**

**1. Login**
- Formulário simples
- Campos email/senha
- Validação básica

**2. Dashboard**
- Cards de métricas
- Gráficos (Chart.js)
- Dados em tempo real

**3. Vendas**
- Tabela de vendas
- Gráficos básicos
- Filtros simples

**4. Estoque**
- Lista de produtos
- Alertas de estoque baixo
- Status visual

**5. Pedidos**
- Lista por status
- Formulário de criação
- Dados do fornecedor

**6. Plataformas**
- Comparativo básico
- Gráficos por canal

**7. Perfil**
- Dados do usuário
- Configurações básicas

#### **Componentes:**

**Cards:**
```css
.summary-card {
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

**Botões:**
```css
.btn-primary {
  background: #018820;
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
}
```

#### **Responsividade:**
- Mobile: Sidebar oculta
- Desktop: Layout completo
- Breakpoint: 768px

#### **Navegação:**
- Menu horizontal
- Estados ativos
- Hover effects
- Links funcionais

#### **Interatividade:**
- Gráficos interativos
- Formulários com validação
- Feedback visual
- Loading states básicos

---

## <a name="c4"></a>4. Desenvolvimento da Aplicação Web (Semana 8)

### 4.1 Demonstração do Sistema Web (Semana 8)

O sistema PCR Labor foi desenvolvido como uma aplicação web funcional para gestão empresarial, implementando as principais funcionalidades planejadas.

#### **🎥 Vídeo Demonstrativo**
*[Link do vídeo será inserido após gravação]*

#### **Sistema Implementado:**

**Tecnologias:**
- Backend: Node.js + Express.js (MVC)
- Frontend: EJS + CSS + JavaScript
- Banco: PostgreSQL (Supabase)
- Autenticação: Sistema de sessões

#### **Funcionalidades Principais:**

**1. Autenticação**
- Login/logout funcional
- Sistema de sessões
- Middleware de proteção
- Credenciais: admin@pcrlabor.com / admin123

**2. Dashboard**
- Métricas básicas em tempo real
- Cards de resumo
- Gráficos com Chart.js
- Dados consolidados

**3. Gestão de Vendas**
- Registro de vendas
- Filtros básicos
- Relatórios simples
- Integração com estoque

**4. Controle de Estoque**
- Cadastro de produtos
- Alertas de estoque baixo
- Categorização
- Status visual

**5. Sistema de Pedidos**
- Criação de pedidos
- Status: Pendente, Aprovado, Entregue
- Integração com fornecedores
- Workflow básico

**6. Fornecedores**
- Cadastro de fornecedores
- Histórico de pedidos
- Dados de contato

**7. Plataformas**
- Comparativo básico
- Métricas por canal
- Shopee implementado

**8. Tarefas**
- Sistema Kanban simples
- Estados básicos
- Sidebar integrada

**9. Assistente IA**
- Respostas baseadas em dados
- Integração com métricas
- Dicas contextuais

#### **Dados de Demonstração:**
- 1 empresa cadastrada
- 1 usuário administrador
- Produtos de exemplo
- Vendas de teste
- Fornecedores fictícios

#### **Responsividade:**
- Layout adaptável
- Mobile básico
- Sidebar responsiva

#### **Status Atual:**
- Sistema funcional
- Todas as páginas implementadas
- APIs básicas funcionando
- Banco de dados configurado
- Pronto para demonstração

### 4.2 Conclusões e Trabalhos Futuros (Semana 8)

O desenvolvimento do sistema PCR Labor foi um projeto individual completo, desde o planejamento até a implementação final.

#### **Objetivos Alcançados:**

**Funcionalidades Implementadas:**
✅ Sistema de login/logout
✅ Dashboard com métricas básicas
✅ Gestão de vendas
✅ Controle de estoque
✅ Sistema de pedidos
✅ Cadastro de fornecedores
✅ Análise por plataforma
✅ Sistema de tarefas
✅ Assistente IA básico
✅ Interface responsiva

**Requisitos Técnicos:**
✅ Arquitetura MVC
✅ Banco PostgreSQL
✅ APIs REST básicas
✅ Frontend com EJS
✅ Sistema de autenticação

#### **Pontos Fortes:**

**1. Estrutura Organizada**
- Separação MVC clara
- Código organizado em módulos
- Padrões consistentes

**2. Interface Funcional**
- Design seguindo wireframes
- Navegação intuitiva
- Responsividade básica

**3. Funcionalidades Completas**
- Todas as páginas implementadas
- Integração entre módulos
- Dados funcionais

#### **Pontos de Melhoria:**

**1. Testes**
- Implementar testes unitários
- Validação de formulários
- Tratamento de erros

**2. Performance**
- Otimização de consultas
- Cache de dados
- Compressão de assets

**3. Segurança**
- Validação mais robusta
- Sanitização de inputs
- Logs de auditoria

#### **Trabalhos Futuros:**

**Curto Prazo:**
- Integração real com APIs externas
- Relatórios em PDF
- Notificações por email
- Melhorias na IA

**Médio Prazo:**
- App mobile
- Dashboard avançado
- Sistema de backup
- Múltiplos usuários

**Longo Prazo:**
- Machine Learning
- Análise preditiva
- Integração IoT
- Escalabilidade

#### **Aprendizados:**

**Técnicos:**
- Desenvolvimento full-stack
- Arquitetura MVC
- APIs REST
- Banco de dados

**Pessoais:**
- Gestão de projeto
- Resolução de problemas
- Documentação
- Planejamento

#### **Conclusão:**

O sistema PCR Labor atende aos objetivos propostos como projeto individual de faculdade. Implementa as funcionalidades principais de um sistema de gestão empresarial, demonstrando conhecimento técnico e capacidade de desenvolvimento completo.

O projeto serve como base sólida para futuras expansões e melhorias, representando uma solução funcional para gestão de pequenas e médias empresas do setor laboratorial.




## <a name="c5"></a>5. Referências

### **Documentação Técnica**

**Node.js e Express.js**
- Node.js Official Documentation. Disponível em: https://nodejs.org/docs/
- Express.js Guide. Disponível em: https://expressjs.com/
- MDN Web Docs - JavaScript. Disponível em: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript

**Banco de Dados**
- PostgreSQL Documentation. Disponível em: https://www.postgresql.org/docs/
- Supabase Documentation. Disponível em: https://supabase.com/docs
- Database Design Best Practices. Disponível em: https://www.postgresql.org/docs/current/ddl-best-practices.html

**Frontend**
- EJS Template Engine. Disponível em: https://ejs.co/
- Chart.js Documentation. Disponível em: https://www.chartjs.org/docs/
- CSS Grid Layout Guide. Disponível em: https://css-tricks.com/snippets/css/complete-guide-grid/



---
---