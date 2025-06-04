// models/pedidoModel.js

const db = require('../config/db');

class Pedido {
  static async getAll(id_empresa = null) {
    try {
      // Retornar array vazio por enquanto para evitar erros de banco
      console.log('⚠️ Modelo de pedidos retornando array vazio (temporário)');
      return [];
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      return [];
    }
  }

  static async getById(id) {
    try {
      const query = `
        SELECT
          p.*,
          prod.nome as produto_nome,
          plat.nome as plataforma_nome
        FROM Pedido p
        LEFT JOIN Produto prod ON p.id_produto = prod.id_produto
        LEFT JOIN Plataforma plat ON p.id_plataforma = plat.id_plataforma
        WHERE p.id_pedido = $1
      `;
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar pedido por ID:', error);
      throw error;
    }
  }

  static async create(pedidoData) {
    try {
      console.log('📥 Modelo recebeu dados:', pedidoData);

      const {
        id_produto,
        id_plataforma,
        quantidade,
        status,
        data_pedido,
        valor_total,
        fornecedor,
        prioridade,
        data_entrega,
        observacoes
      } = pedidoData;

      const query = `
        INSERT INTO Pedido (
          id_produto,
          id_plataforma,
          quantidade,
          status,
          data_pedido,
          valor_total,
          fornecedor,
          prioridade,
          data_entrega,
          observacoes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const values = [
        id_produto,
        id_plataforma,
        quantidade,
        status,
        data_pedido,
        valor_total,
        fornecedor,
        prioridade,
        data_entrega,
        observacoes
      ];

      console.log('📤 Executando query com valores:', values);

      const result = await db.query(query, values);

      console.log('✅ Pedido criado no banco:', result.rows[0]);

      return result.rows[0];
    } catch (error) {
      console.error('❌ Erro ao criar pedido no modelo:', error);
      throw error;
    }
  }

  static async update(id, pedidoData) {
    try {
      const { id_produto, id_plataforma, quantidade, status, data_pedido, valor_total } = pedidoData;
      const query = `
        UPDATE Pedido
        SET id_produto = $1, id_plataforma = $2, quantidade = $3, status = $4,
            data_pedido = $5, valor_total = $6, updated_at = CURRENT_TIMESTAMP
        WHERE id_pedido = $7
        RETURNING *
      `;
      const result = await db.query(query, [id_produto, id_plataforma, quantidade, status, data_pedido, valor_total, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const query = 'DELETE FROM Pedido WHERE id_pedido = $1 RETURNING *';
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao deletar pedido:', error);
      throw error;
    }
  }

  static async getPedidosPorStatus(id_empresa = null) {
    try {
      // Retornar dados vazios por enquanto para evitar erros de banco
      console.log('⚠️ Modelo de pedidos por status retornando array vazio (temporário)');
      return [];
    } catch (error) {
      console.error('Erro ao buscar pedidos por status:', error);
      return [];
    }
  }

  static async getPedidosPorPeriodo(dataInicio, dataFim, id_empresa = null) {
    try {
      let query = `
        SELECT
          p.*,
          prod.nome as produto_nome,
          prod.sku,
          plat.nome as plataforma_nome
        FROM Pedido p
        LEFT JOIN Produto prod ON p.id_produto = prod.id_produto
        LEFT JOIN Plataforma plat ON p.id_plataforma = plat.id_plataforma
        WHERE p.data_pedido BETWEEN $1 AND $2
      `;

      const params = [dataInicio, dataFim];
      if (id_empresa) {
        query += ` AND prod.id_empresa = $3`;
        params.push(id_empresa);
      }

      query += ` ORDER BY p.data_pedido DESC`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar pedidos por período:', error);
      throw error;
    }
  }

  static async getPedidosPorMes() {
    try {
      const query = `
        SELECT
          DATE_TRUNC('month', data_pedido) as mes,
          COUNT(*) as total_pedidos,
          SUM(valor_total) as valor_total,
          SUM(quantidade) as quantidade_total
        FROM Pedido
        WHERE data_pedido >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', data_pedido)
        ORDER BY mes DESC
      `;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar pedidos por mês:', error);
      throw error;
    }
  }

  static async getProjecaoCompras(id_empresa = null) {
    try {
      let query = `
        SELECT
          prod.nome as produto_nome,
          prod.sku,
          prod.estoque_atual,
          AVG(p.quantidade) as media_pedidos,
          COUNT(p.id_pedido) as total_pedidos,
          CASE
            WHEN prod.estoque_atual <= 10 THEN 'URGENTE'
            WHEN prod.estoque_atual <= 30 THEN 'MEDIO'
            ELSE 'BAIXO'
          END as prioridade
        FROM Produto prod
        LEFT JOIN Pedido p ON prod.id_produto = p.id_produto
        WHERE p.data_pedido >= CURRENT_DATE - INTERVAL '30 days'
      `;

      const params = [];
      if (id_empresa) {
        query += ` AND prod.id_empresa = $1`;
        params.push(id_empresa);
      }

      query += ` GROUP BY prod.id_produto, prod.nome, prod.sku, prod.estoque_atual
                 ORDER BY prioridade DESC, prod.estoque_atual ASC`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar projeção de compras:', error);
      throw error;
    }
  }
}

module.exports = Pedido;
