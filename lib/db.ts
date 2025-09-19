import { Pool } from 'pg';

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'castro',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // máximo número de clientes en el pool
  idleTimeoutMillis: 30000, // tiempo antes de cerrar un cliente inactivo
  connectionTimeoutMillis: 2000, // tiempo antes de timeout en conexión
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
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('Conexión a la base de datos exitosa:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    return false;
  }
}

// Función para cerrar el pool
export async function closePool() {
  await pool.end();
}
