#!/usr/bin/env node

/**
 * Script para insertar datos de prueba para informes de ventas
 * Usa la configuración de Next.js para conectarse a la base de datos
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Cargar configuración desde el archivo de configuración de Neon
function loadNeonConfig() {
  try {
    const configPath = path.join(__dirname, '..', 'neon-config.env');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    const config = {};
    configContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
          config[key.trim()] = value.trim();
        }
      }
    });
    
    return config;
  } catch (error) {
    console.error('Error cargando configuración de Neon:', error.message);
    return null;
  }
}

async function insertarDatosPrueba() {
  // Cargar configuración
  const config = loadNeonConfig();
  if (!config) {
    console.error('❌ No se pudo cargar la configuración de la base de datos');
    process.exit(1);
  }

  // Configurar pool de conexiones
  const pool = new Pool({
    connectionString: config.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  
  try {
    console.log('🔄 Iniciando inserción de datos de prueba para informes de ventas...');
    console.log('📡 Conectando a Neon Database...');
    
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
          if (error.message.includes('duplicate key') || 
              error.message.includes('already exists') ||
              error.message.includes('violates unique constraint')) {
            console.log(`⚠️  Statement ${i + 1}/${statements.length} - Datos ya existen (ignorado)`);
          } else {
            console.error(`❌ Error en statement ${i + 1}/${statements.length}:`, error.message);
            console.error(`   Statement: ${statement.substring(0, 100)}...`);
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
      try {
        const result = await client.query(verificacion.query);
        const total = result.rows[0].total;
        console.log(`   ${verificacion.tabla}: ${total} registros`);
      } catch (error) {
        console.log(`   ${verificacion.tabla}: Error verificando - ${error.message}`);
      }
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
