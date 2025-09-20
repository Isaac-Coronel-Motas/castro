import { Pool } from 'pg';

// Configuración de la base de datos optimizada para Neon
const dbConfig = {
  // Usar DATABASE_URL si está disponible (recomendado para Neon)
  connectionString: process.env.DATABASE_URL,
  
  // Configuración individual como fallback
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'castro',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  
  // Configuración SSL optimizada para Neon
  ssl: process.env.DATABASE_URL ? 
    { rejectUnauthorized: false } : 
    (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false),
  
  // Configuración del pool optimizada para Neon
  max: parseInt(process.env.DB_POOL_MAX || '20'),
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000'),
  
  // Configuraciones adicionales para Neon
  allowExitOnIdle: true,
  keepAlive: true,
  keepAliveInitialDelayMillis: 0,
};

// Crear el pool de conexiones
export const pool = new Pool(dbConfig);

// Manejar errores del pool
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de conexiones:', err);
  process.exit(-1);
});

// Función para probar la conexión
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    client.release();
    
    console.log('✅ Conexión a Neon Database exitosa:');
    console.log('   📅 Hora actual:', result.rows[0].current_time);
    console.log('   🐘 PostgreSQL:', result.rows[0].postgres_version);
    console.log('   🌐 Host:', process.env.DB_HOST || 'localhost');
    console.log('   🗄️  Base de datos:', process.env.DB_NAME || 'castro');
    
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con Neon Database:');
    console.error('   🔍 Detalles:', error);
    console.error('   🌐 Host:', process.env.DB_HOST || 'localhost');
    console.error('   🗄️  Base de datos:', process.env.DB_NAME || 'castro');
    console.error('   🔐 Usuario:', process.env.DB_USER || 'postgres');
    return false;
  }
}

// Función para cerrar el pool
export async function closePool() {
  await pool.end();
}
