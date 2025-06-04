// models/vendaModel.js

const db = require('../config/db');

class Venda {
  static async getAll(id_empresa = null) {
    try {
      let query = `
        SELECT v.*, p.nome as produto_nome, p.sku, pl.nome as plataforma_nome
        FROM Venda v
        LEFT JOIN Produto p ON v.id_produto = p.id_produto
        LEFT JOIN Plataforma pl ON v.id_plataforma = pl.id_plataforma
      `;

      const params = [];
      if (id_empresa) {
        query += ` WHERE v.id_empresa = $1`;
        params.push(id_empresa);
      }

      query += ` ORDER BY v.data DESC, v.id_venda DESC`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar vendas: ${error.message}`);
    }
  }

  static async getById(id) {
    try {
      const result = await db.query(`
        SELECT v.*, p.nome as produto_nome, p.sku, pl.nome as plataforma_nome
        FROM Venda v
        LEFT JOIN Produto p ON v.id_produto = p.id_produto
        LEFT JOIN Plataforma pl ON v.id_plataforma = pl.id_plataforma
        WHERE v.id_venda = $1
      `, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao buscar venda: ${error.message}`);
    }
  }

  static async getByPeriodo(dataInicio, dataFim, id_empresa = null) {
    try {
      let query = `
        SELECT v.*, p.nome as produto_nome, p.sku, pl.nome as plataforma_nome
        FROM Venda v
        LEFT JOIN Produto p ON v.id_produto = p.id_produto
        LEFT JOIN Plataforma pl ON v.id_plataforma = pl.id_plataforma
        WHERE v.data BETWEEN $1 AND $2
      `;

      const params = [dataInicio, dataFim];
      if (id_empresa) {
        query += ` AND v.id_empresa = $3`;
        params.push(id_empresa);
      }

      query += ` ORDER BY v.data DESC`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar vendas por período: ${error.message}`);
    }
  }

  static async getByPlataforma(idPlataforma, id_empresa = null) {
    try {
      let query = `
        SELECT v.*, p.nome as produto_nome, p.sku, pl.nome as plataforma_nome
        FROM Venda v
        LEFT JOIN Produto p ON v.id_produto = p.id_produto
        LEFT JOIN Plataforma pl ON v.id_plataforma = pl.id_plataforma
        WHERE v.id_plataforma = $1
      `;

      const params = [idPlataforma];
      if (id_empresa) {
        query += ` AND v.id_empresa = $2`;
        params.push(id_empresa);
      }

      query += ` ORDER BY v.data DESC`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar vendas por plataforma: ${error.message}`);
    }
  }

  static async create(vendaData) {
    try {
      const { id_produto, id_empresa, id_plataforma, quantidade, data, valor_total, preco_unitario, status } = vendaData;
      const result = await db.query(
        'INSERT INTO Venda (id_produto, id_empresa, id_plataforma, quantidade, data, valor_total, preco_unitario, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [id_produto, id_empresa, id_plataforma, quantidade, data, valor_total, preco_unitario || (valor_total / quantidade), status || 'confirmada']
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao criar venda: ${error.message}`);
    }
  }

  static async update(id, vendaData) {
    try {
      const { id_produto, id_plataforma, quantidade, data, valor_total } = vendaData;
      const result = await db.query(
        'UPDATE Venda SET id_produto = $1, id_plataforma = $2, quantidade = $3, data = $4, valor_total = $5 WHERE id_venda = $6 RETURNING *',
        [id_produto, id_plataforma, quantidade, data, valor_total, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao atualizar venda: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const result = await db.query('DELETE FROM Venda WHERE id_venda = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao deletar venda: ${error.message}`);
    }
  }

  static async getRelatorioPorProduto(idProduto, dataInicio, dataFim) {
    try {
      const result = await db.query(`
        SELECT
          COUNT(*) as total_vendas,
          SUM(quantidade) as quantidade_total,
          SUM(valor_total) as valor_total,
          AVG(valor_total) as valor_medio
        FROM Venda
        WHERE id_produto = $1
        AND data BETWEEN $2 AND $3
      `, [idProduto, dataInicio, dataFim]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao gerar relatório por produto: ${error.message}`);
    }
  }

  static async getVendasPorMes() {
    try {
      const result = await db.query(`
        SELECT
          DATE_TRUNC('month', data) as mes,
          COUNT(*) as total_vendas,
          SUM(quantidade) as quantidade_total,
          SUM(valor_total) as valor_total
        FROM Venda
        WHERE data >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', data)
        ORDER BY mes DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar vendas por mês: ${error.message}`);
    }
  }
}

module.exports = Venda;
