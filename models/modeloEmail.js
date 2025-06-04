// models/modeloEmail.js

const db = require('../config/db');

class Email {
  static async getAll(id_empresa = null, id_usuario = null) {
    try {
      let query = `
        SELECT
          e.*,
          u.nome as remetente_nome,
          u.email as remetente_email
        FROM Email e
        LEFT JOIN Usuario u ON e.id_remetente = u.id_usuario
      `;

      const params = [];
      const conditions = [];

      if (id_empresa) {
        conditions.push(`e.id_empresa = $${params.length + 1}`);
        params.push(id_empresa);
      }

      if (id_usuario) {
        conditions.push(`(e.id_destinatario = $${params.length + 1} OR e.id_remetente = $${params.length + 1})`);
        params.push(id_usuario);
        params.push(id_usuario);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += ` ORDER BY e.created_at DESC`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar emails: ${error.message}`);
    }
  }

  static async getById(id) {
    try {
      const result = await db.query(`
        SELECT
          e.*,
          ur.nome as remetente_nome,
          ur.email as remetente_email,
          ud.nome as destinatario_nome,
          ud.email as destinatario_email
        FROM Email e
        LEFT JOIN Usuario ur ON e.id_remetente = ur.id_usuario
        LEFT JOIN Usuario ud ON e.id_destinatario = ud.id_usuario
        WHERE e.id_email = $1
      `, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao buscar email: ${error.message}`);
    }
  }

  static async getCaixaEntrada(id_usuario, id_empresa) {
    try {
      const result = await db.query(`
        SELECT
          e.*,
          u.nome as remetente_nome,
          u.email as remetente_email
        FROM Email e
        LEFT JOIN Usuario u ON e.id_remetente = u.id_usuario
        WHERE e.id_destinatario = $1 AND e.id_empresa = $2
        ORDER BY e.created_at DESC
      `, [id_usuario, id_empresa]);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar caixa de entrada: ${error.message}`);
    }
  }

  static async getEnviados(id_usuario, id_empresa) {
    try {
      const result = await db.query(`
        SELECT
          e.*,
          u.nome as destinatario_nome,
          u.email as destinatario_email
        FROM Email e
        LEFT JOIN Usuario u ON e.id_destinatario = u.id_usuario
        WHERE e.id_remetente = $1 AND e.id_empresa = $2
        ORDER BY e.created_at DESC
      `, [id_usuario, id_empresa]);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar emails enviados: ${error.message}`);
    }
  }

  static async create(emailData) {
    try {
      const {
        id_empresa,
        id_remetente,
        id_destinatario,
        email_destinatario,
        assunto,
        corpo,
        prioridade,
        categoria
      } = emailData;

      const result = await db.query(
        `INSERT INTO Email (
          id_empresa, id_remetente, id_destinatario, email_destinatario,
          assunto, corpo, prioridade, categoria, status, lido
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'enviado', false) RETURNING *`,
        [
          id_empresa,
          id_remetente,
          id_destinatario,
          email_destinatario,
          assunto,
          corpo,
          prioridade || 'normal',
          categoria || 'geral'
        ]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao criar email: ${error.message}`);
    }
  }

  static async marcarComoLido(id) {
    try {
      const result = await db.query(
        'UPDATE Email SET lido = true, data_leitura = CURRENT_TIMESTAMP WHERE id_email = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao marcar email como lido: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const result = await db.query('DELETE FROM Email WHERE id_email = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao deletar email: ${error.message}`);
    }
  }

  static async getEstatisticas(id_usuario, id_empresa) {
    try {
      const result = await db.query(`
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN lido = false AND id_destinatario = $1 THEN 1 END) as nao_lidos,
          COUNT(CASE WHEN id_remetente = $1 THEN 1 END) as enviados,
          COUNT(CASE WHEN id_destinatario = $1 THEN 1 END) as recebidos,
          COUNT(CASE WHEN prioridade = 'alta' AND lido = false AND id_destinatario = $1 THEN 1 END) as urgentes
        FROM Email
        WHERE id_empresa = $2 AND (id_remetente = $1 OR id_destinatario = $1)
      `, [id_usuario, id_empresa]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao buscar estatísticas de email: ${error.message}`);
    }
  }

  // Simular recebimento de emails automáticos
  static async simularEmailsAutomaticos(id_empresa) {
    try {
      const emailsSimulados = [
        {
          id_empresa,
          id_remetente: null,
          id_destinatario: null,
          email_destinatario: 'sistema@pcrlab.com',
          assunto: 'Relatório Diário de Vendas',
          corpo: 'Seu relatório diário de vendas está pronto. Vendas hoje: R$ 2.450,00. Crescimento: +15% vs ontem.',
          prioridade: 'normal',
          categoria: 'relatorio'
        },
        {
          id_empresa,
          id_remetente: null,
          id_destinatario: null,
          email_destinatario: 'alertas@pcrlab.com',
          assunto: 'Alerta: Estoque Baixo',
          corpo: 'Os seguintes produtos estão com estoque baixo: Kit PCR COVID-19 (5 unidades), Teste Hepatite B (3 unidades).',
          prioridade: 'alta',
          categoria: 'alerta'
        },
        {
          id_empresa,
          id_remetente: null,
          id_destinatario: null,
          email_destinatario: 'vendas@pcrlab.com',
          assunto: 'Nova Venda - Mercado Livre',
          corpo: 'Nova venda registrada: Kit PCR COVID-19 x2. Valor: R$ 179,80. Cliente: João Silva.',
          prioridade: 'normal',
          categoria: 'venda'
        }
      ];

      const resultados = [];
      for (const email of emailsSimulados) {
        const resultado = await this.create(email);
        resultados.push(resultado);
      }

      return resultados;
    } catch (error) {
      throw new Error(`Erro ao simular emails automáticos: ${error.message}`);
    }
  }

  // Buscar por filtros
  static async buscarPorFiltros(filtros, id_empresa) {
    try {
      let query = `
        SELECT
          e.*,
          ur.nome as remetente_nome,
          ur.email as remetente_email,
          ud.nome as destinatario_nome,
          ud.email as destinatario_email
        FROM Email e
        LEFT JOIN Usuario ur ON e.id_remetente = ur.id_usuario
        LEFT JOIN Usuario ud ON e.id_destinatario = ud.id_usuario
        WHERE e.id_empresa = $1
      `;

      const params = [id_empresa];
      let paramCount = 1;

      if (filtros.categoria && filtros.categoria !== 'todos') {
        paramCount++;
        query += ` AND e.categoria = $${paramCount}`;
        params.push(filtros.categoria);
      }

      if (filtros.prioridade && filtros.prioridade !== 'todas') {
        paramCount++;
        query += ` AND e.prioridade = $${paramCount}`;
        params.push(filtros.prioridade);
      }

      if (filtros.lido !== undefined && filtros.lido !== 'todos') {
        paramCount++;
        query += ` AND e.lido = $${paramCount}`;
        params.push(filtros.lido === 'true');
      }

      if (filtros.data_inicio) {
        paramCount++;
        query += ` AND e.created_at >= $${paramCount}`;
        params.push(filtros.data_inicio);
      }

      if (filtros.data_fim) {
        paramCount++;
        query += ` AND e.created_at <= $${paramCount}`;
        params.push(filtros.data_fim);
      }

      query += ` ORDER BY e.created_at DESC`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar emails por filtros: ${error.message}`);
    }
  }
}

module.exports = Email;
