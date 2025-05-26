#!/usr/bin/env node

/**
 * Script para verificar as senhas dos usuários no banco
 */

const db = require('../config/db');
const bcrypt = require('bcrypt');

async function verificarSenhas() {
  try {
    console.log('🔍 Verificando senhas dos usuários...\n');

    // Buscar todos os usuários
    const result = await db.query(`
      SELECT u.*, e.nome_fantasia as empresa_nome 
      FROM Usuario u 
      LEFT JOIN Empresa e ON u.id_empresa = e.id_empresa 
      ORDER BY u.id_usuario
    `);

    const usuarios = result.rows;
    console.log(`👥 Encontrados ${usuarios.length} usuários:\n`);

    for (const usuario of usuarios) {
      console.log(`👤 ${usuario.nome} (${usuario.email})`);
      console.log(`🏢 Empresa: ${usuario.empresa_nome}`);
      console.log(`🔑 Hash da senha: ${usuario.senha_hash.substring(0, 20)}...`);
      
      // Testar senhas comuns
      const senhasParaTestar = [
        'admin123',
        'usuario123', 
        'lula123',
        'maria123',
        '123456'
      ];

      let senhaEncontrada = false;
      for (const senha of senhasParaTestar) {
        const match = await bcrypt.compare(senha, usuario.senha_hash);
        if (match) {
          console.log(`✅ Senha correta: "${senha}"`);
          senhaEncontrada = true;
          break;
        }
      }

      if (!senhaEncontrada) {
        console.log(`❌ Nenhuma senha comum funcionou`);
      }

      console.log(''); // Linha em branco
    }

    console.log('🎯 RESUMO PARA LOGIN:');
    console.log('=' .repeat(50));
    
    for (const usuario of usuarios) {
      const senhasParaTestar = ['admin123', 'usuario123', 'lula123', 'maria123', '123456'];
      
      for (const senha of senhasParaTestar) {
        const match = await bcrypt.compare(senha, usuario.senha_hash);
        if (match) {
          console.log(`📧 ${usuario.email} | 🔑 ${senha} | 🏢 ${usuario.empresa_nome}`);
          break;
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await db.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  verificarSenhas();
}

module.exports = { verificarSenhas };
