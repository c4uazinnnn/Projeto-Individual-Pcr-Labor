// models/pedidoModel.js

const db = require('../config/db');

class Pedido {
  static async getAll(id_empresa = null) {
    try {
      console.log('📋 Buscando todos os pedidos...');

      let query = `
        SELECT
          p.*,
          prod.nome as produto_nome,
          prod.sku,
          plat.nome as plataforma_nome
        FROM Pedido p
        LEFT JOIN Produto prod ON p.id_produto = prod.id_produto
        LEFT JOIN Plataforma plat ON p.id_plataforma = plat.id_plataforma
      `;

      const params = [];
      if (id_empresa) {
        query += ` WHERE prod.id_empresa = $1`;
        params.push(id_empresa);
      }

      query += ` ORDER BY p.created_at DESC`;

      console.log('📋 Query pedidos:', query);
      console.log('📋 Params:', params);

      const result = await db.query(query, params);

      console.log(`✅ ${result.rows.length} pedidos encontrados`);
      if (result.rows.length > 0) {
        console.log('📋 Primeiro pedido:', result.rows[0]);
      }

      return result.rows;
    } catch (error) {
      console.error('❌ Erro ao buscar pedidos:', error);
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
        fornecedor
      } = pedidoData;

      const query = `
        INSERT INTO Pedido (
          id_produto,
          id_plataforma,
          quantidade,
          status,
          data_pedido,
          valor_total,
          fornecedor
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const values = [
        id_produto,
        id_plataforma,
        quantidade,
        status,
        data_pedido,
        valor_total,
        fornecedor
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
      console.log(`📝 Atualizando pedido ${id} com dados:`, pedidoData);

      const {
        id_produto,
        id_plataforma,
        quantidade,
        status,
        data_pedido,
        valor_total,
        fornecedor
      } = pedidoData;

      const query = `
        UPDATE Pedido
        SET id_produto = $1,
            id_plataforma = $2,
            quantidade = $3,
            status = $4,
            data_pedido = $5,
            valor_total = $6,
            fornecedor = $7,
            updated_at = CURRENT_TIMESTAMP
        WHERE id_pedido = $8
        RETURNING *
      `;

      const values = [
        id_produto,
        id_plataforma || 1,
        quantidade,
        status,
        data_pedido,
        valor_total,
        fornecedor,
        id
      ];

      console.log('📤 Executando update com valores:', values);

      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        throw new Error(`Pedido com ID ${id} não encontrado`);
      }

      console.log('✅ Pedido atualizado:', result.rows[0]);

      return result.rows[0];
    } catch (error) {
      console.error('❌ Erro ao atualizar pedido:', error);
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
      console.log('📊 Buscando pedidos por status...');

      let query = `
        SELECT
          p.status,
          COUNT(*) as total,
          SUM(p.valor_total) as valor_total
        FROM Pedido p
        LEFT JOIN Produto prod ON p.id_produto = prod.id_produto
      `;

      const params = [];
      if (id_empresa) {
        query += ` WHERE prod.id_empresa = $1`;
        params.push(id_empresa);
      }

      query += ` GROUP BY p.status ORDER BY total DESC`;

      console.log('📊 Query status:', query);
      console.log('📊 Params:', params);

      const result = await db.query(query, params);

      console.log(`✅ ${result.rows.length} status encontrados`);

      return result.rows;
    } catch (error) {
      console.error('❌ Erro ao buscar pedidos por status:', error);
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
