const { Pool } = require('pg');
require('dotenv').config();

// Configuração para produção (Railway) e desenvolvimento
const poolConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

const pool = new Pool(poolConfig);

// Testar conexão
pool.on('connect', () => {
    console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Erro na conexão PostgreSQL:', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};