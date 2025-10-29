const { Pool } = require('pg');
require('dotenv').config();

// CONFIGURAÇÃO ROBUSTA PARA LOCAL E PRODUÇÃO
let poolConfig;

console.log('🔍 Verificando ambiente...');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '***URL OCULTADA***' : 'Não definida');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Verificação mais robusta da DATABASE_URL
const hasValidDatabaseUrl = process.env.DATABASE_URL && 
                           (process.env.DATABASE_URL.startsWith('postgres://') ||
                            process.env.DATABASE_URL.startsWith('postgresql://')) &&
                           process.env.DATABASE_URL.length > 20;

if (hasValidDatabaseUrl) {
  // PRODUÇÃO (Railway) - só se DATABASE_URL for válida
  console.log('🚀 Modo PRODUÇÃO: Usando DATABASE_URL do Railway');
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
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
    connectionTimeoutMillis: 5000,
  };
}

console.log('🔧 Configuração final:', {
  host: poolConfig.host || 'from DATABASE_URL',
  database: poolConfig.database || 'from DATABASE_URL',
  port: poolConfig.port || 'from DATABASE_URL'
});

const pool = new Pool(poolConfig);

// Testar conexão
pool.on('connect', () => {
    console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Erro na conexão PostgreSQL:', err);
});

// Teste de conexão inicial com retry
const testConnection = async (retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await pool.query('SELECT NOW()');
      console.log('✅ Teste de conexão bem-sucedido:', result.rows[0].now);
      return;
    } catch (err) {
      console.error(`❌ Tentativa ${i + 1}/${retries} - Erro no teste de conexão:`, err.message);
      if (i < retries - 1) {
        console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  console.error('💥 Todas as tentativas de conexão falharam');
};

setTimeout(() => {
  testConnection();
}, 2000);

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};