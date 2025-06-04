// models/usuarioModel.js

const db = require('../config/db');
const bcrypt = require('bcrypt');

class Usuario {
  static async getAll() {
    try {
      const query = `
        SELECT
          u.*,
          e.nome_fantasia as empresa_nome
        FROM Usuario u
        LEFT JOIN Empresa e ON u.id_empresa = e.id_empresa
        ORDER BY u.created_at DESC
      `;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const query = `
        SELECT
          u.*,
          e.nome_fantasia as empresa_nome,
          e.cnpj as empresa_cnpj
        FROM Usuario u
        LEFT JOIN Empresa e ON u.id_empresa = e.id_empresa
        WHERE u.id_usuario = $1
      `;
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  static async getByEmail(email) {
    try {
      const query = `
        SELECT
          u.*,
          e.nome_fantasia as empresa_nome,
          e.cnpj as empresa_cnpj
        FROM Usuario u
        LEFT JOIN Empresa e ON u.id_empresa = e.id_empresa
        WHERE u.email = $1
      `;
      const result = await db.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const { nome, email, senha, id_empresa } = userData;

      // Hash da senha
      const saltRounds = 10;
      const senha_hash = await bcrypt.hash(senha, saltRounds);

      const query = `
        INSERT INTO Usuario (nome, email, senha_hash, id_empresa)
        VALUES ($1, $2, $3, $4)
        RETURNING id_usuario, nome, email, id_empresa, created_at
      `;
      const result = await db.query(query, [nome, email, senha_hash, id_empresa]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  static async update(id, userData) {
    try {
      const { nome, email, telefone, cargo, avatar } = userData;
      const query = `
        UPDATE Usuario
        SET nome = $1, email = $2, telefone = $3, cargo = $4, avatar = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id_usuario = $6
        RETURNING id_usuario, nome, email, id_empresa, telefone, cargo, avatar, updated_at
      `;
      const result = await db.query(query, [nome, email, telefone, cargo, avatar, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  static async updatePassword(id, novaSenha) {
    try {
      const saltRounds = 10;
      const senha_hash = await bcrypt.hash(novaSenha, saltRounds);

      const query = `
        UPDATE Usuario
        SET senha_hash = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id_usuario = $2
        RETURNING id_usuario
      `;
      const result = await db.query(query, [senha_hash, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const query = 'DELETE FROM Usuario WHERE id_usuario = $1 RETURNING *';
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  }

  static async validatePassword(email, senha) {
    try {
      const usuario = await this.getByEmail(email);
      if (!usuario) {
        return null;
      }

      const isValid = await bcrypt.compare(senha, usuario.senha_hash);
      if (isValid) {
        // Remover senha_hash do retorno
        delete usuario.senha_hash;
        return usuario;
      }

      return null;
    } catch (error) {
      console.error('Erro ao validar senha:', error);
      throw error;
    }
  }

  static async getMetodosPagamento(userId) {
    try {
      // Retornar dados de demonstração por enquanto
      console.log('⚠️ Modelo de métodos de pagamento retornando dados de demonstração (temporário)');
      return [
        {
          id_metodo: 1,
          tipo: 'boleto',
          descricao: 'Boleto Bancário',
          dados_pagamento: {
            banco: 'Banco do Brasil',
            agencia: '1234-5',
            conta: '67890-1'
          },
          ativo: true
        },
        {
          id_metodo: 2,
          tipo: 'transferencia',
          descricao: 'Transferência Bancária',
          dados_pagamento: {
            banco: 'Itaú',
            agencia: '0987',
            conta: '12345-6',
            pix: 'admin@pcrlabor.com'
          },
          ativo: true
        },
        {
          id_metodo: 3,
          tipo: 'link',
          descricao: 'Link de Pagamento',
          dados_pagamento: {
            gateway: 'PagSeguro',
            link: 'https://pagseguro.uol.com.br/checkout/v2/payment.html?code=ABC123'
          },
          ativo: false
        }
      ];
    } catch (error) {
      console.error('Erro ao buscar métodos de pagamento:', error);
      return [];
    }
  }

  static async addMetodoPagamento(userId, metodoData) {
    try {
      const { tipo, descricao, dados_pagamento, ativo } = metodoData;
      const query = `
        INSERT INTO MetodoPagamento (id_usuario, tipo, descricao, dados_pagamento, ativo)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const result = await db.query(query, [userId, tipo, descricao, JSON.stringify(dados_pagamento), ativo]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao adicionar método de pagamento:', error);
      throw error;
    }
  }

  static async updateMetodoPagamento(id, metodoData) {
    try {
      const { tipo, descricao, dados_pagamento, ativo } = metodoData;
      const query = `
        UPDATE MetodoPagamento
        SET tipo = $1, descricao = $2, dados_pagamento = $3, ativo = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id_metodo = $5
        RETURNING *
      `;
      const result = await db.query(query, [tipo, descricao, JSON.stringify(dados_pagamento), ativo, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao atualizar método de pagamento:', error);
      throw error;
    }
  }

  static async deleteMetodoPagamento(id) {
    try {
      const query = 'DELETE FROM MetodoPagamento WHERE id_metodo = $1 RETURNING *';
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao deletar método de pagamento:', error);
      throw error;
    }
  }

  static async updateUltimoLogin(id) {
    try {
      const query = `
        UPDATE Usuario
        SET ultimo_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id_usuario = $1
        RETURNING id_usuario, ultimo_login
      `;
      const result = await db.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao atualizar último login:', error);
      throw error;
    }
  }
}

module.exports = Usuario;
