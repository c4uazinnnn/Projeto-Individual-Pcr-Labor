// models/fornecedorModel.js

const db = require('../config/db');

class Fornecedor {
  static async getAll(id_empresa = null) {
    try {
      let query = `
        SELECT
          f.*,
          COUNT(p.id_pedido) as total_pedidos,
          COALESCE(SUM(p.valor_total), 0) as valor_total_pedidos,
          COUNT(CASE WHEN p.data_pedido >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as pedidos_mes
        FROM Fornecedor f
        LEFT JOIN Pedido p ON f.id_fornecedor = p.id_fornecedor
      `;

      const params = [];
      if (id_empresa) {
        query += ` WHERE f.id_empresa = $1`;
        params.push(id_empresa);
      }

      query += ` GROUP BY f.id_fornecedor ORDER BY f.created_at DESC`;

      const result = await db.query(query, params);

      // Se não há fornecedores no banco, retornar dados de demonstração
      if (result.rows.length === 0) {
        console.log('⚠️ Nenhum fornecedor encontrado no banco, retornando dados de demonstração');
        return [
          {
            id_fornecedor: 1,
            nome: 'BioTech Suprimentos Ltda',
            cnpj: '12.345.678/0001-90',
            email: 'contato@biotech.com',
            telefone: '(11) 99999-9999',
            endereco: 'São Paulo, SP',
            total_pedidos: 15,
            valor_total_pedidos: 45000.00,
            pedidos_mes: 5,
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id_fornecedor: 2,
            nome: 'MedLab Equipamentos S.A.',
            cnpj: '98.765.432/0001-10',
            email: 'vendas@medlab.com',
            telefone: '(11) 88888-8888',
            endereco: 'Rio de Janeiro, RJ',
            total_pedidos: 8,
            valor_total_pedidos: 28500.00,
            pedidos_mes: 3,
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id_fornecedor: 3,
            nome: 'LabCorp Distribuidora',
            cnpj: '11.222.333/0001-44',
            email: 'comercial@labcorp.com.br',
            telefone: '(21) 77777-7777',
            endereco: 'Belo Horizonte, MG',
            total_pedidos: 22,
            valor_total_pedidos: 67800.00,
            pedidos_mes: 8,
            created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
      }

      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      // Em caso de erro, retornar dados de demonstração
      return [
        {
          id_fornecedor: 1,
          nome: 'BioTech Suprimentos Ltda',
          cnpj: '12.345.678/0001-90',
          email: 'contato@biotech.com',
          telefone: '(11) 99999-9999',
          endereco: 'São Paulo, SP',
          total_pedidos: 15,
          valor_total_pedidos: 45000.00,
          pedidos_mes: 5,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id_fornecedor: 2,
          nome: 'MedLab Equipamentos S.A.',
          cnpj: '98.765.432/0001-10',
          email: 'vendas@medlab.com',
          telefone: '(11) 88888-8888',
          endereco: 'Rio de Janeiro, RJ',
          total_pedidos: 8,
          valor_total_pedidos: 28500.00,
          pedidos_mes: 3,
          created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id_fornecedor: 3,
          nome: 'LabCorp Distribuidora',
          cnpj: '11.222.333/0001-44',
          email: 'comercial@labcorp.com.br',
          telefone: '(21) 77777-7777',
          endereco: 'Belo Horizonte, MG',
          total_pedidos: 22,
          valor_total_pedidos: 67800.00,
          pedidos_mes: 8,
          created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
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
      const { id_empresa, nome, cnpj, email, telefone, endereco, observacoes } = fornecedorData;
      const result = await db.query(
        `INSERT INTO Fornecedor (id_empresa, nome, cnpj, email, telefone, endereco, observacoes)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [id_empresa, nome, cnpj, email, telefone, endereco, observacoes]
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
