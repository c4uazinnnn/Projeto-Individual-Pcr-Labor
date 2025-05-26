// models/empresaModel.js

const db = require('../config/db');

class Empresa {
  static async getAll() {
    try {
      const result = await db.query('SELECT * FROM Empresa ORDER BY id_empresa');
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar empresas: ${error.message}`);
    }
  }

  static async getById(id) {
    try {
      const result = await db.query('SELECT * FROM Empresa WHERE id_empresa = $1', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao buscar empresa: ${error.message}`);
    }
  }

  static async create(empresaData) {
    try {
      const { nome_fantasia, cnpj } = empresaData;
      const result = await db.query(
        'INSERT INTO Empresa (nome_fantasia, cnpj) VALUES ($1, $2) RETURNING *',
        [nome_fantasia, cnpj]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao criar empresa: ${error.message}`);
    }
  }

  static async update(id, empresaData) {
    try {
      const { nome_fantasia, cnpj } = empresaData;
      const result = await db.query(
        'UPDATE Empresa SET nome_fantasia = $1, cnpj = $2, updated_at = CURRENT_TIMESTAMP WHERE id_empresa = $3 RETURNING *',
        [nome_fantasia, cnpj, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao atualizar empresa: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const result = await db.query('DELETE FROM Empresa WHERE id_empresa = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao deletar empresa: ${error.message}`);
    }
  }
}

module.exports = Empresa;
