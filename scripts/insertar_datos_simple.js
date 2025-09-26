#!/usr/bin/env node

/**
 * Script simple para insertar datos de prueba usando la configuración de Next.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Usar la misma configuración que la aplicación Next.js
const DATABASE_URL = 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function insertarDatos() {
  console.log('🔄 Iniciando inserción de datos de prueba...');
  
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  
  try {
    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, '..', 'datos_prueba_informes_ventas_simple.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('📝 Ejecutando script SQL...');
    
    // Ejecutar el script completo
    await client.query(sqlContent);
    
    console.log('✅ Datos insertados correctamente!');
    
    // Verificar datos
    const result = await client.query('SELECT COUNT(*) as total FROM ventas');
    console.log(`📊 Total de ventas: ${result.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

insertarDatos();
