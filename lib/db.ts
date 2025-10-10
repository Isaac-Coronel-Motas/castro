import { Pool } from 'pg';

// Configuración de la base de datos
const dbConfig = {
  // Configuración para PostgreSQL local
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'castro',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  
  // Configuración SSL (deshabilitada para localhost)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  
  // Configuración del pool
  max: parseInt(process.env.DB_POOL_MAX || '10'),
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '10000'),
  
  // Configuraciones adicionales
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
    
    console.log('✅ Conexión a PostgreSQL local exitosa:');
    console.log('   📅 Hora actual:', result.rows[0].current_time);
    console.log('   🐘 PostgreSQL:', result.rows[0].postgres_version);
    console.log('   🌐 Host:', dbConfig.host);
    console.log('   🗄️  Base de datos:', dbConfig.database);
    console.log('   🔐 Usuario:', dbConfig.user);
    console.log('   🔌 Puerto:', dbConfig.port);
    
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL local:');
    console.error('   🔍 Detalles:', error);
    console.error('   🌐 Host:', dbConfig.host);
    console.error('   🗄️  Base de datos:', dbConfig.database);
    console.error('   🔐 Usuario:', dbConfig.user);
    console.error('   🔌 Puerto:', dbConfig.port);
    console.error('   💡 Verifica que PostgreSQL esté ejecutándose y las credenciales sean correctas');
    return false;
  }
}

// Función para cerrar el pool
export async function closePool() {
  await pool.end();
}