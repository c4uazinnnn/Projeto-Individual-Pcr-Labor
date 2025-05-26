const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'bd_pcr_labor',
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Teste de conexão
pool.on('connect', () => {
  console.log('Conectado ao banco de dados');
});

pool.on('error', (err) => {
  console.error('Erro na conexão com o banco de dados:', err);
});

module.exports = pool;
