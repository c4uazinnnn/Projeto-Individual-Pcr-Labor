// services/servicoImportacaoExcel.js

const XLSX = require('xlsx');
const Produto = require('../models/modeloProdutos');
const multer = require('multer');
const path = require('path');

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos Excel (.xlsx, .xls) e CSV são permitidos'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

class ServicoImportacaoExcel {
  
  // Middleware para upload
  static getUploadMiddleware() {
    return upload.single('arquivo');
  }
  
  // Processar arquivo Excel/CSV
  static async processarArquivo(filePath, id_empresa) {
    try {
      console.log('📄 Processando arquivo:', filePath);
      
      // Ler arquivo Excel
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Converter para JSON
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      console.log(`📊 Encontradas ${data.length} linhas no arquivo`);
      
      const resultados = {
        total: data.length,
        sucessos: 0,
        erros: 0,
        detalhes: []
      };
      
      // Processar cada linha
      for (let i = 0; i < data.length; i++) {
        const linha = data[i];
        
        try {
          const produto = await this.processarLinhaProduto(linha, id_empresa, i + 2); // +2 porque linha 1 é cabeçalho
          
          if (produto) {
            resultados.sucessos++;
            resultados.detalhes.push({
              linha: i + 2,
              status: 'sucesso',
              produto: produto.nome,
              sku: produto.sku
            });
          }
          
        } catch (error) {
          resultados.erros++;
          resultados.detalhes.push({
            linha: i + 2,
            status: 'erro',
            erro: error.message,
            dados: linha
          });
        }
      }
      
      console.log('✅ Processamento concluído:', resultados);
      return resultados;
      
    } catch (error) {
      console.error('❌ Erro ao processar arquivo:', error);
      throw new Error(`Erro ao processar arquivo: ${error.message}`);
    }
  }
  
  // Processar uma linha do Excel
  static async processarLinhaProduto(linha, id_empresa, numeroLinha) {
    try {
      // Mapear colunas (aceita diferentes formatos de cabeçalho)
      const nome = linha['Nome'] || linha['nome'] || linha['NOME'] || linha['Produto'];
      const sku = linha['SKU'] || linha['sku'] || linha['Código'] || linha['codigo'];
      const preco = parseFloat(linha['Preço'] || linha['preco'] || linha['PRECO'] || linha['Valor'] || 0);
      const preco_base = parseFloat(linha['Preço Base'] || linha['preco_base'] || linha['Custo'] || linha['custo'] || 0);
      const custo_frete = parseFloat(linha['Frete'] || linha['frete'] || linha['Custo Frete'] || linha['custo_frete'] || 0);
      const estoque = parseInt(linha['Estoque'] || linha['estoque'] || linha['Quantidade'] || linha['quantidade'] || 0);
      const categoria = linha['Categoria'] || linha['categoria'] || linha['CATEGORIA'] || 'Importado';
      const descricao = linha['Descrição'] || linha['descricao'] || linha['DESCRICAO'] || '';
      
      // Validações básicas
      if (!nome || nome.trim() === '') {
        throw new Error(`Linha ${numeroLinha}: Nome do produto é obrigatório`);
      }
      
      if (!sku || sku.toString().trim() === '') {
        throw new Error(`Linha ${numeroLinha}: SKU é obrigatório`);
      }
      
      if (isNaN(preco) || preco < 0) {
        throw new Error(`Linha ${numeroLinha}: Preço inválido`);
      }
      
      if (isNaN(estoque) || estoque < 0) {
        throw new Error(`Linha ${numeroLinha}: Estoque inválido`);
      }
      
      // Verificar se SKU já existe na empresa
      const produtoExistente = await this.verificarSKUExistente(sku, id_empresa);
      if (produtoExistente) {
        throw new Error(`Linha ${numeroLinha}: SKU '${sku}' já existe na empresa`);
      }
      
      // Criar produto
      const produtoData = {
        id_empresa,
        nome: nome.trim(),
        sku: sku.toString().trim(),
        preco,
        preco_base,
        custo_frete,
        estoque_atual: estoque,
        categoria: categoria.trim(),
        descricao: descricao.trim()
      };
      
      console.log(`📦 Criando produto linha ${numeroLinha}:`, produtoData.nome);
      
      const novoProduto = await Produto.create(produtoData);
      return novoProduto;
      
    } catch (error) {
      console.error(`❌ Erro na linha ${numeroLinha}:`, error.message);
      throw error;
    }
  }
  
  // Verificar se SKU já existe
  static async verificarSKUExistente(sku, id_empresa) {
    try {
      const produtos = await Produto.getAll(id_empresa);
      return produtos.find(p => p.sku === sku);
    } catch (error) {
      console.error('Erro ao verificar SKU:', error);
      return null;
    }
  }
  
  // Gerar template Excel para download
  static gerarTemplateExcel() {
    try {
      const template = [
        {
          'Nome': 'Kit PCR COVID-19',
          'SKU': 'PCR-COVID-001',
          'Preço': 89.90,
          'Preço Base': 45.00,
          'Frete': 8.50,
          'Estoque': 100,
          'Categoria': 'Diagnóstico',
          'Descrição': 'Kit para diagnóstico de COVID-19'
        },
        {
          'Nome': 'Teste Rápido Antígeno',
          'SKU': 'TESTE-AG-002',
          'Preço': 25.90,
          'Preço Base': 12.00,
          'Frete': 3.50,
          'Estoque': 250,
          'Categoria': 'Teste Rápido',
          'Descrição': 'Teste rápido para detecção de antígenos'
        }
      ];
      
      const worksheet = XLSX.utils.json_to_sheet(template);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos');
      
      // Definir larguras das colunas
      worksheet['!cols'] = [
        { width: 25 }, // Nome
        { width: 15 }, // SKU
        { width: 12 }, // Preço
        { width: 15 }, // Preço Base
        { width: 10 }, // Frete
        { width: 10 }, // Estoque
        { width: 15 }, // Categoria
        { width: 40 }  // Descrição
      ];
      
      return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
    } catch (error) {
      console.error('Erro ao gerar template:', error);
      throw new Error('Erro ao gerar template Excel');
    }
  }
  
  // Validar estrutura do arquivo
  static validarEstrutura(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (data.length < 2) {
        throw new Error('Arquivo deve conter pelo menos uma linha de dados além do cabeçalho');
      }
      
      const cabecalho = data[0];
      const colunasObrigatorias = ['Nome', 'SKU', 'Preço', 'Estoque'];
      const colunasEncontradas = [];
      
      colunasObrigatorias.forEach(coluna => {
        const encontrada = cabecalho.some(c => 
          c && c.toString().toLowerCase().includes(coluna.toLowerCase())
        );
        if (encontrada) {
          colunasEncontradas.push(coluna);
        }
      });
      
      if (colunasEncontradas.length < colunasObrigatorias.length) {
        const faltando = colunasObrigatorias.filter(c => !colunasEncontradas.includes(c));
        throw new Error(`Colunas obrigatórias não encontradas: ${faltando.join(', ')}`);
      }
      
      return {
        valido: true,
        linhas: data.length - 1,
        colunas: cabecalho.length
      };
      
    } catch (error) {
      throw new Error(`Erro na validação: ${error.message}`);
    }
  }
}

module.exports = ServicoImportacaoExcel;
