#!/usr/bin/env node

/**
 * Script de prueba de conexión a Neon Database
 * Ejecutar con: node scripts/test-neon-connection.js
 */

import { testConnection, closePool } from '../lib/db.js';

async function main() {
  console.log('🚀 Iniciando prueba de conexión a Neon Database...\n');
  
  // Mostrar configuración actual
  console.log('📋 Configuración actual:');
  console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurado' : '❌ No configurado');
  console.log('   DB_HOST:', process.env.DB_HOST || 'localhost');
  console.log('   DB_NAME:', process.env.DB_NAME || 'castro');
  console.log('   DB_USER:', process.env.DB_USER || 'postgres');
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('');
  
  // Probar conexión
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log('\n🎉 ¡Conexión exitosa! Tu aplicación está lista para usar Neon Database.');
    
    // Probar algunas consultas básicas
    console.log('\n🔍 Probando consultas básicas...');
    try {
      const { pool } = await import('../lib/db.js');
      const client = await pool.connect();
      
      // Verificar tablas principales
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      console.log('   📊 Tablas encontradas:', tablesResult.rows.length);
      if (tablesResult.rows.length > 0) {
        console.log('   📋 Primeras 5 tablas:');
        tablesResult.rows.slice(0, 5).forEach(row => {
          console.log(`      - ${row.table_name}`);
        });
      }
      
      // Verificar usuario administrador
      const userResult = await client.query(`
        SELECT usuario_id, nombre, username, email, activo 
        FROM usuarios 
        WHERE username = 'admin'
      `);
      
      if (userResult.rows.length > 0) {
        console.log('   👤 Usuario administrador encontrado:', userResult.rows[0].nombre);
      } else {
        console.log('   ⚠️  Usuario administrador no encontrado');
      }
      
      client.release();
      
    } catch (error) {
      console.error('   ❌ Error en consultas de prueba:', error.message);
    }
    
  } else {
    console.log('\n💥 Conexión fallida. Verifica tu configuración.');
    console.log('\n📝 Pasos para solucionar:');
    console.log('   1. Copia el contenido de neon-config.env a .env.local');
    console.log('   2. Verifica que DATABASE_URL esté correcto');
    console.log('   3. Asegúrate de que la base de datos esté desplegada');
    console.log('   4. Ejecuta los scripts SQL en orden:');
    console.log('      - sys_taller_jc_v5.sql');
    console.log('      - create_admin_user_v5.sql');
    console.log('      - create_configuracion_table_v5.sql');
  }
  
  // Cerrar conexión
  await closePool();
  console.log('\n🔚 Prueba completada.');
}

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as testNeonConnection };
