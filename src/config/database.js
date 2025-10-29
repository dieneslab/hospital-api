const { Pool } = require('pg');
require('dotenv').config();

// CONFIGURAÇÃO ROBUSTA PARA LOCAL E PRODUÇÃO
let poolConfig;

console.log('🔍 Verificando ambiente...');
console.log('DATABASE_URL existe?', !!process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Verifica se DATABASE_URL é válida (não vazia e formato correto)
const hasValidDatabaseUrl = process.env.DATABASE_URL && 
                           process.env.DATABASE_URL.startsWith('postgres://') &&
                           process.env.DATABASE_URL.length > 20;

if (hasValidDatabaseUrl) {
  // PRODUÇÃO (Railway) - só se DATABASE_URL for válida
  console.log('🚀 Modo PRODUÇÃO: Usando DATABASE_URL do Railway');
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  };
} else {
  // DESENVOLVIMENTO (Local) - fallback para configuração individual
  console.log('💻 Modo LOCAL: Usando configuração individual');
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'hospital_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'senha123',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

console.log('🔧 Configuração final:', {
  host: poolConfig.host || 'from DATABASE_URL',
  database: poolConfig.database || 'from DATABASE_URL'
});

const pool = new Pool(poolConfig);

// Testar conexão
pool.on('connect', () => {
    console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Erro na conexão PostgreSQL:', err);
});

// Teste de conexão inicial (com tratamento de erro)
setTimeout(() => {
  pool.query('SELECT NOW()')
    .then((result) => {
      console.log('✅ Teste de conexão bem-sucedido:', result.rows[0].now);
    })
    .catch(err => {
      console.error('❌ Erro no teste de conexão:', err.message);
    });
}, 1000);

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};