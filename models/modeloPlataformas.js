// models/plataformaModel.js

const db = require('../config/db');

class Plataforma {
  static async getAll() {
    try {
      const result = await db.query('SELECT * FROM Plataforma ORDER BY nome');
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar plataformas: ${error.message}`);
    }
  }

  static async getById(id) {
    try {
      const result = await db.query('SELECT * FROM Plataforma WHERE id_plataforma = $1', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao buscar plataforma: ${error.message}`);
    }
  }

  static async create(plataformaData) {
    try {
      const { nome } = plataformaData;
      const result = await db.query(
        'INSERT INTO Plataforma (nome) VALUES ($1) RETURNING *',
        [nome]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao criar plataforma: ${error.message}`);
    }
  }

  static async update(id, plataformaData) {
    try {
      const { nome } = plataformaData;
      const result = await db.query(
        'UPDATE Plataforma SET nome = $1 WHERE id_plataforma = $2 RETURNING *',
        [nome, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao atualizar plataforma: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const result = await db.query('DELETE FROM Plataforma WHERE id_plataforma = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao deletar plataforma: ${error.message}`);
    }
  }

  static async getVendasPorPlataforma() {
    try {
      const result = await db.query(`
        SELECT 
          p.id_plataforma,
          p.nome,
          COUNT(v.id_venda) as total_vendas,
          SUM(v.quantidade) as quantidade_total,
          SUM(v.valor_total) as valor_total
        FROM Plataforma p
        LEFT JOIN Venda v ON p.id_plataforma = v.id_plataforma
        GROUP BY p.id_plataforma, p.nome
        ORDER BY valor_total DESC NULLS LAST
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar vendas por plataforma: ${error.message}`);
    }
  }
}

module.exports = Plataforma;
