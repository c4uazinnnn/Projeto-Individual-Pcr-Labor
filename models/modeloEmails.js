// models/modeloEmails.js

const db = require('../config/db');

class Email {
  // Buscar todos os emails de uma empresa
  static async getAll(id_empresa) {
    try {
      const query = `
        SELECT 
          id_email,
          email_destinatario,
          email_remetente,
          assunto,
          corpo,
          categoria,
          prioridade,
          lido,
          data_envio,
          data_recebimento,
          status,
          created_at,
          updated_at
        FROM Email 
        WHERE id_empresa = $1 
        ORDER BY data_recebimento DESC, created_at DESC
      `;
      
      const result = await db.query(query, [id_empresa]);
      return result.rows;
    } catch (error) {
      console.error('❌ Erro ao buscar emails:', error);
      throw error;
    }
  }

  // Buscar email por ID
  static async getById(id_email) {
    try {
      const query = `
        SELECT * FROM Email 
        WHERE id_email = $1
      `;
      
      const result = await db.query(query, [id_email]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Erro ao buscar email por ID:', error);
      throw error;
    }
  }

  // Criar novo email
  static async create(emailData) {
    try {
      const {
        id_empresa,
        email_destinatario,
        email_remetente,
        assunto,
        corpo,
        categoria = 'GERAL',
        prioridade = 'normal',
        data_envio = null,
        data_recebimento = null
      } = emailData;

      const query = `
        INSERT INTO Email (
          id_empresa,
          email_destinatario,
          email_remetente,
          assunto,
          corpo,
          categoria,
          prioridade,
          lido,
          data_envio,
          data_recebimento,
          status,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const values = [
        id_empresa,
        email_destinatario,
        email_remetente || 'sistema@pcrlabor.com',
        assunto,
        corpo,
        categoria.toUpperCase(),
        prioridade,
        false, // lido
        data_envio,
        data_recebimento || new Date(),
        'ENVIADO'
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Erro ao criar email:', error);
      throw error;
    }
  }

  // Atualizar email
  static async update(id_email, emailData) {
    try {
      const {
        email_destinatario,
        email_remetente,
        assunto,
        corpo,
        categoria,
        prioridade,
        lido,
        status
      } = emailData;

      const query = `
        UPDATE Email SET
          email_destinatario = COALESCE($2, email_destinatario),
          email_remetente = COALESCE($3, email_remetente),
          assunto = COALESCE($4, assunto),
          corpo = COALESCE($5, corpo),
          categoria = COALESCE($6, categoria),
          prioridade = COALESCE($7, prioridade),
          lido = COALESCE($8, lido),
          status = COALESCE($9, status),
          updated_at = CURRENT_TIMESTAMP
        WHERE id_email = $1
        RETURNING *
      `;

      const values = [
        id_email,
        email_destinatario,
        email_remetente,
        assunto,
        corpo,
        categoria,
        prioridade,
        lido,
        status
      ];

      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Erro ao atualizar email:', error);
      throw error;
    }
  }

  // Marcar email como lido
  static async marcarComoLido(id_email) {
    try {
      const query = `
        UPDATE Email SET
          lido = true,
          updated_at = CURRENT_TIMESTAMP
        WHERE id_email = $1
        RETURNING *
      `;

      const result = await db.query(query, [id_email]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Erro ao marcar email como lido:', error);
      throw error;
    }
  }

  // Deletar email
  static async delete(id_email) {
    try {
      const query = `DELETE FROM Email WHERE id_email = $1`;
      await db.query(query, [id_email]);
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar email:', error);
      throw error;
    }
  }

  // Buscar estatísticas de emails
  static async getEstatisticas(id_empresa) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN lido = true THEN 1 END) as lidos,
          COUNT(CASE WHEN lido = false THEN 1 END) as nao_lidos,
          COUNT(CASE WHEN categoria = 'SPAM' THEN 1 END) as spam,
          COUNT(CASE WHEN prioridade = 'alta' THEN 1 END) as alta_prioridade
        FROM Email 
        WHERE id_empresa = $1
      `;
      
      const result = await db.query(query, [id_empresa]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de emails:', error);
      throw error;
    }
  }

  // Buscar emails por categoria
  static async getByCategoria(id_empresa, categoria) {
    try {
      const query = `
        SELECT * FROM Email 
        WHERE id_empresa = $1 AND categoria = $2
        ORDER BY data_recebimento DESC
      `;
      
      const result = await db.query(query, [id_empresa, categoria.toUpperCase()]);
      return result.rows;
    } catch (error) {
      console.error('❌ Erro ao buscar emails por categoria:', error);
      throw error;
    }
  }

  // Marcar todos como lidos
  static async marcarTodosComoLidos(id_empresa) {
    try {
      const query = `
        UPDATE Email SET
          lido = true,
          updated_at = CURRENT_TIMESTAMP
        WHERE id_empresa = $1 AND lido = false
        RETURNING COUNT(*)
      `;

      const result = await db.query(query, [id_empresa]);
      return result.rowCount;
    } catch (error) {
      console.error('❌ Erro ao marcar todos como lidos:', error);
      throw error;
    }
  }
}

module.exports = Email;
