// models/produtoModel.js

const db = require('../config/db');

class Produto {
  static async getAll(id_empresa = null) {
    try {
      let query = `
        SELECT
          p.*,
          CASE
            WHEN p.estoque_atual <= COALESCE(p.estoque_minimo, 10) THEN true
            ELSE false
          END as estoque_baixo
        FROM Produto p
      `;

      const params = [];
      if (id_empresa) {
        query += ` WHERE p.id_empresa = $1`;
        params.push(id_empresa);
      }

      query += ` ORDER BY p.created_at DESC`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar produtos: ${error.message}`);
    }
  }

  static async getById(id) {
    try {
      const result = await db.query(`
        SELECT p.*, e.nome_fantasia as empresa_nome
        FROM Produto p
        LEFT JOIN Empresa e ON p.id_empresa = e.id_empresa
        WHERE p.id_produto = $1
      `, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao buscar produto: ${error.message}`);
    }
  }

  static async getByEmpresa(idEmpresa) {
    try {
      const result = await db.query(`
        SELECT * FROM Produto
        WHERE id_empresa = $1
        ORDER BY nome
      `, [idEmpresa]);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar produtos da empresa: ${error.message}`);
    }
  }

  static async create(produtoData) {
    try {
      const {
        id_empresa,
        nome,
        sku,
        preco,
        preco_base,
        custo_frete,
        estoque_atual,
        categoria,
        descricao
      } = produtoData;

      const result = await db.query(
        `INSERT INTO Produto (
          id_empresa, nome, sku, preco, preco_base, custo_frete,
          estoque_atual, categoria, descricao
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          id_empresa,
          nome,
          sku,
          preco,
          preco_base || 0,
          custo_frete || 0,
          estoque_atual,
          categoria || 'Geral',
          descricao || ''
        ]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao criar produto: ${error.message}`);
    }
  }

  static async update(id, produtoData) {
    try {
      const {
        nome,
        sku,
        preco,
        preco_base,
        custo_frete,
        estoque_atual,
        estoque_minimo,
        categoria,
        descricao
      } = produtoData;

      const result = await db.query(
        `UPDATE Produto SET
          nome = $1, sku = $2, preco = $3, preco_base = $4, custo_frete = $5,
          estoque_atual = $6, estoque_minimo = $7, categoria = $8, descricao = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE id_produto = $10 RETURNING *`,
        [
          nome,
          sku,
          preco,
          preco_base || 0,
          custo_frete || 0,
          estoque_atual,
          estoque_minimo || 10,
          categoria || 'Geral',
          descricao || '',
          id
        ]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao atualizar produto: ${error.message}`);
    }
  }

  static async updateEstoque(id, novoEstoque) {
    try {
      const result = await db.query(
        'UPDATE Produto SET estoque_atual = $1, updated_at = CURRENT_TIMESTAMP WHERE id_produto = $2 RETURNING *',
        [novoEstoque, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao atualizar estoque: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const result = await db.query('DELETE FROM Produto WHERE id_produto = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao deletar produto: ${error.message}`);
    }
  }

  static async getEstoqueBaixo(limite = 10, id_empresa = null) {
    try {
      let query = `
        SELECT p.*, e.nome_fantasia as empresa_nome
        FROM Produto p
        LEFT JOIN Empresa e ON p.id_empresa = e.id_empresa
        WHERE p.estoque_atual <= $1
      `;

      const params = [limite];
      if (id_empresa) {
        query += ` AND p.id_empresa = $2`;
        params.push(id_empresa);
      }

      query += ` ORDER BY p.estoque_atual ASC`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar produtos com estoque baixo: ${error.message}`);
    }
  }

  // ===== IMPORTAÇÃO VIA EXCEL =====
  static async importarExcel(produtosArray, id_empresa) {
    try {
      const resultados = {
        sucesso: 0,
        erros: 0,
        detalhes: []
      };

      for (const produto of produtosArray) {
        try {
          // Validar dados obrigatórios
          if (!produto.nome || !produto.sku) {
            resultados.erros++;
            resultados.detalhes.push({
              linha: produto.linha || 'N/A',
              erro: 'Nome e SKU são obrigatórios',
              produto: produto.nome || 'Sem nome'
            });
            continue;
          }

          // Verificar se SKU já existe
          const existente = await db.query(
            'SELECT id_produto FROM Produto WHERE sku = $1 AND id_empresa = $2',
            [produto.sku, id_empresa]
          );

          if (existente.rows.length > 0) {
            resultados.erros++;
            resultados.detalhes.push({
              linha: produto.linha || 'N/A',
              erro: 'SKU já existe',
              produto: produto.nome
            });
            continue;
          }

          // Criar produto
          const novoProduto = await this.create({
            id_empresa,
            nome: produto.nome,
            sku: produto.sku,
            preco: parseFloat(produto.preco || 0),
            preco_base: parseFloat(produto.preco_base || 0),
            custo_frete: parseFloat(produto.custo_frete || 0),
            estoque_atual: parseInt(produto.estoque_atual || 0),
            categoria: produto.categoria || 'Importado',
            descricao: produto.descricao || ''
          });

          resultados.sucesso++;
          resultados.detalhes.push({
            linha: produto.linha || 'N/A',
            sucesso: true,
            produto: produto.nome,
            id_produto: novoProduto.id_produto
          });

        } catch (error) {
          resultados.erros++;
          resultados.detalhes.push({
            linha: produto.linha || 'N/A',
            erro: error.message,
            produto: produto.nome || 'Erro na linha'
          });
        }
      }

      return resultados;
    } catch (error) {
      throw new Error(`Erro na importação: ${error.message}`);
    }
  }

  // ===== CALCULAR LUCRO =====
  static calcularLucro(preco_venda, preco_base, custo_frete = 0) {
    const precoVenda = parseFloat(preco_venda || 0);
    const precoBase = parseFloat(preco_base || 0);
    const custoFrete = parseFloat(custo_frete || 0);

    const lucroAbsoluto = precoVenda - precoBase - custoFrete;
    const lucroPercentual = precoBase > 0 ? ((lucroAbsoluto / precoBase) * 100) : 0;

    return {
      lucro_absoluto: lucroAbsoluto,
      lucro_percentual: lucroPercentual,
      margem_liquida: precoVenda > 0 ? ((lucroAbsoluto / precoVenda) * 100) : 0
    };
  }

  // ===== RELATÓRIO DE LUCRATIVIDADE =====
  static async getRelatorioLucratividade(id_empresa = null) {
    try {
      let query = `
        SELECT
          p.*,
          (p.preco - p.preco_base - p.custo_frete) as lucro_absoluto,
          CASE
            WHEN p.preco_base > 0 THEN
              ((p.preco - p.preco_base - p.custo_frete) / p.preco_base) * 100
            ELSE 0
          END as lucro_percentual,
          CASE
            WHEN p.preco > 0 THEN
              ((p.preco - p.preco_base - p.custo_frete) / p.preco) * 100
            ELSE 0
          END as margem_liquida
        FROM Produto p
      `;

      const params = [];
      if (id_empresa) {
        query += ` WHERE p.id_empresa = $1`;
        params.push(id_empresa);
      }

      query += ` ORDER BY lucro_percentual DESC`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao gerar relatório de lucratividade: ${error.message}`);
    }
  }
}

module.exports = Produto;
