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
}

module.exports = Produto;
