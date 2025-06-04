// models/tarefaModel.js

const db = require('../config/db');

class Tarefa {
  static async getAll(id_usuario = null, id_empresa = null) {
    try {
      let query = `
        SELECT
          t.id_tarefa,
          t.id_usuario,
          t.titulo,
          t.descricao,
          t.status,
          t.prioridade,
          t.data_criacao,
          t.data_conclusao,
          t.created_at,
          t.updated_at,
          u.id_empresa
        FROM Tarefa t
        LEFT JOIN Usuario u ON t.id_usuario = u.id_usuario
      `;

      const params = [];
      const conditions = [];

      if (id_usuario) {
        conditions.push(`t.id_usuario = $${params.length + 1}`);
        params.push(id_usuario);
      }

      if (id_empresa) {
        conditions.push(`u.id_empresa = $${params.length + 1}`);
        params.push(id_empresa);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += ` ORDER BY
          CASE t.prioridade
            WHEN 'urgente' THEN 1
            WHEN 'alta' THEN 2
            WHEN 'media' THEN 3
            WHEN 'baixa' THEN 4
            ELSE 5
          END,
          CASE t.status
            WHEN 'a_fazer' THEN 1
            WHEN 'fazendo' THEN 2
            WHEN 'concluido' THEN 3
            ELSE 4
          END,
          t.created_at DESC
      `;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const query = 'SELECT * FROM Tarefa WHERE id_tarefa = $1';
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar tarefa por ID:', error);
      throw error;
    }
  }

  static async create(tarefaData) {
    try {
      const { id_usuario, titulo, descricao, prioridade, status } = tarefaData;
      const query = `
        INSERT INTO Tarefa (id_usuario, titulo, descricao, prioridade, status)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const result = await db.query(query, [
        id_usuario,
        titulo,
        descricao || '',
        prioridade || 'media',
        status || 'a_fazer'
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }
  }

  static async update(id, tarefaData) {
    try {
      const { titulo, descricao, prioridade, status } = tarefaData;
      const query = `
        UPDATE Tarefa
        SET titulo = $1, descricao = $2, prioridade = $3, status = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id_tarefa = $5
        RETURNING *
      `;
      const result = await db.query(query, [titulo, descricao, prioridade, status, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const query = 'DELETE FROM Tarefa WHERE id_tarefa = $1 RETURNING *';
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      throw error;
    }
  }

  static async toggleConcluida(id) {
    try {
      const query = `
        UPDATE Tarefa
        SET concluida = NOT concluida, updated_at = CURRENT_TIMESTAMP
        WHERE id_tarefa = $1
        RETURNING *
      `;
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao alterar status da tarefa:', error);
      throw error;
    }
  }

  static async getPendentes() {
    try {
      const query = `
        SELECT * FROM Tarefa
        WHERE concluida = FALSE
        ORDER BY
          CASE prioridade
            WHEN 'urgente' THEN 1
            WHEN 'alta' THEN 2
            WHEN 'normal' THEN 3
            WHEN 'baixa' THEN 4
            ELSE 5
          END,
          created_at DESC
      `;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar tarefas pendentes:', error);
      throw error;
    }
  }

  static async getEstatisticas() {
    try {
      const query = `
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN concluida = FALSE THEN 1 END) as pendentes,
          COUNT(CASE WHEN concluida = TRUE THEN 1 END) as concluidas,
          COUNT(CASE WHEN prioridade = 'urgente' AND concluida = FALSE THEN 1 END) as urgentes,
          COUNT(CASE WHEN data_vencimento < CURRENT_DATE AND concluida = FALSE THEN 1 END) as atrasadas
        FROM Tarefa
      `;
      const result = await db.query(query);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar estatísticas de tarefas:', error);
      throw error;
    }
  }
}

module.exports = Tarefa;
