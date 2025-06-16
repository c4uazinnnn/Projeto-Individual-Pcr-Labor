// models/fornecedorModel.js

const db = require('../config/db');

class Fornecedor {
  static async getAll(id_empresa = null) {
    try {
      // Query simplificada sem JOIN com Pedido (que não tem campo id_fornecedor)
      let query = `
        SELECT
          f.*,
          0 as total_pedidos,
          0 as valor_total_pedidos,
          0 as pedidos_mes
        FROM Fornecedor f
      `;

      const params = [];
      if (id_empresa) {
        query += ` WHERE f.id_empresa = $1`;
        params.push(id_empresa);
      }

      query += ` ORDER BY f.created_at DESC`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const result = await db.query('SELECT * FROM Fornecedor WHERE id_fornecedor = $1', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao buscar fornecedor: ${error.message}`);
    }
  }

  static async create(fornecedorData) {
    try {
      const { id_empresa, nome, cnpj, email, telefone, endereco } = fornecedorData;
      const result = await db.query(
        `INSERT INTO Fornecedor (id_empresa, nome, cnpj, email, telefone, endereco)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [id_empresa, nome, cnpj, email, telefone, endereco]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao criar fornecedor: ${error.message}`);
    }
  }

  static async update(id, fornecedorData) {
    try {
      const { nome, cnpj, email, telefone, endereco, observacoes } = fornecedorData;
      const result = await db.query(
        `UPDATE Fornecedor
         SET nome = $1, cnpj = $2, email = $3, telefone = $4, endereco = $5, observacoes = $6, updated_at = CURRENT_TIMESTAMP
         WHERE id_fornecedor = $7 RETURNING *`,
        [nome, cnpj, email, telefone, endereco, observacoes, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao atualizar fornecedor: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const result = await db.query('DELETE FROM Fornecedor WHERE id_fornecedor = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao deletar fornecedor: ${error.message}`);
    }
  }

  static async getByEmpresa(id_empresa) {
    try {
      const result = await db.query(
        'SELECT * FROM Fornecedor WHERE id_empresa = $1 ORDER BY nome ASC',
        [id_empresa]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar fornecedores da empresa: ${error.message}`);
    }
  }
}

module.exports = Fornecedor;
