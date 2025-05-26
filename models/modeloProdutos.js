// models/produtoModel.js

const db = require('../config/db');

class Produto {
  static async getAll() {
    try {
      const query = `
        SELECT
          p.*,
          CASE
            WHEN p.estoque_atual <= COALESCE(p.estoque_minimo, 10) THEN true
            ELSE false
          END as estoque_baixo
        FROM Produto p
        ORDER BY p.created_at DESC
      `;

      const result = await db.query(query);
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
      const { id_empresa, nome, sku, preco, estoque_atual } = produtoData;
      const result = await db.query(
        'INSERT INTO Produto (id_empresa, nome, sku, preco, estoque_atual) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [id_empresa, nome, sku, preco, estoque_atual]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao criar produto: ${error.message}`);
    }
  }

  static async update(id, produtoData) {
    try {
      const { nome, sku, preco, estoque_atual } = produtoData;
      const result = await db.query(
        'UPDATE Produto SET nome = $1, sku = $2, preco = $3, estoque_atual = $4, updated_at = CURRENT_TIMESTAMP WHERE id_produto = $5 RETURNING *',
        [nome, sku, preco, estoque_atual, id]
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

  static async getEstoqueBaixo(limite = 10) {
    try {
      const result = await db.query(`
        SELECT p.*, e.nome_fantasia as empresa_nome
        FROM Produto p
        LEFT JOIN Empresa e ON p.id_empresa = e.id_empresa
        WHERE p.estoque_atual <= $1
        ORDER BY p.estoque_atual ASC
      `, [limite]);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar produtos com estoque baixo: ${error.message}`);
    }
  }
}

module.exports = Produto;
