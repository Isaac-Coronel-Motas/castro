#!/usr/bin/env node

/**
 * Script para insertar datos de prueba para informes de ventas
 * Ejecuta el archivo SQL de datos de prueba
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos Neon
const DATABASE_URL = 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function insertarDatosPrueba() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando inserción de datos de prueba para informes de ventas...');
    
    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, '..', 'datos_prueba_informes_ventas.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Dividir el contenido en statements individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Ejecutando ${statements.length} statements SQL...`);
    
    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await client.query(statement);
          console.log(`✅ Statement ${i + 1}/${statements.length} ejecutado correctamente`);
        } catch (error) {
          // Ignorar errores de duplicados (ON CONFLICT DO NOTHING)
          if (error.message.includes('duplicate key') || error.message.includes('already exists')) {
            console.log(`⚠️  Statement ${i + 1}/${statements.length} - Datos ya existen (ignorado)`);
          } else {
            console.error(`❌ Error en statement ${i + 1}/${statements.length}:`, error.message);
            throw error;
          }
        }
      }
    }
    
    console.log('🎉 Datos de prueba insertados correctamente!');
    
    // Verificar que los datos se insertaron
    console.log('\n📊 Verificando datos insertados...');
    
    const verificaciones = [
      { tabla: 'ventas', query: 'SELECT COUNT(*) as total FROM ventas' },
      { tabla: 'ventas_detalle', query: 'SELECT COUNT(*) as total FROM ventas_detalle' },
      { tabla: 'cobros', query: 'SELECT COUNT(*) as total FROM cobros' },
      { tabla: 'nota_credito_cabecera', query: 'SELECT COUNT(*) as total FROM nota_credito_cabecera' },
      { tabla: 'nota_debito_cabecera', query: 'SELECT COUNT(*) as total FROM nota_debito_cabecera' }
    ];
    
    for (const verificacion of verificaciones) {
      const result = await client.query(verificacion.query);
      const total = result.rows[0].total;
      console.log(`   ${verificacion.tabla}: ${total} registros`);
    }
    
    console.log('\n✨ Verificación completada! Los datos están listos para probar los informes de ventas.');
    
  } catch (error) {
    console.error('❌ Error insertando datos de prueba:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  insertarDatosPrueba()
    .then(() => {
      console.log('\n🚀 Script completado exitosamente!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error ejecutando script:', error);
      process.exit(1);
    });
}

module.exports = { insertarDatosPrueba };
