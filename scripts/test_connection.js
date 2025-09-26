#!/usr/bin/env node

/**
 * Script para probar la conexión a la base de datos Neon
 */

const { Pool } = require('pg');

// Configuración de Neon Database
const DATABASE_URL = 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function testConnection() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔄 Probando conexión a Neon Database...');
    
    const client = await pool.connect();
    console.log('✅ Conexión exitosa!');
    
    // Probar una consulta simple
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('📅 Hora actual:', result.rows[0].current_time);
    console.log('🐘 Versión PostgreSQL:', result.rows[0].postgres_version.split(' ')[0]);
    
    // Verificar tablas existentes
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('ventas', 'clientes', 'productos', 'categorias')
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tablas encontradas:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    client.release();
    await pool.end();
    
    console.log('\n🎉 Prueba de conexión completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testConnection();
}

module.exports = { testConnection };
