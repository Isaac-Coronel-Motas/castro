#!/usr/bin/env node

/**
 * Script para asignar permisos al rol administrador
 */

const { Pool } = require('pg');

// Configuración de conexión
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function assignPermissions() {
  try {
    console.log('🔧 Asignando permisos al rol Administrador...\n');
    
    const client = await pool.connect();
    
    // Verificar permisos actuales del rol
    const currentResult = await client.query(`
      SELECT COUNT(*) as total 
      FROM rol_permisos 
      WHERE rol_id = 1
    `);
    
    console.log('📊 Permisos actuales del rol 1:', currentResult.rows[0].total);
    
    if (currentResult.rows[0].total == 0) {
      console.log('❌ No hay permisos asignados. Asignando todos los permisos...');
      
      // Asignar todos los permisos al rol administrador
      const insertResult = await client.query(`
        INSERT INTO rol_permisos (rol_id, permiso_id, created_at)
        SELECT 1, permiso_id, CURRENT_TIMESTAMP
        FROM permisos
        WHERE activo = true
        ON CONFLICT (rol_id, permiso_id) DO NOTHING
      `);
      
      console.log('✅ Permisos asignados exitosamente');
      
      // Verificar el resultado
      const verifyResult = await client.query(`
        SELECT COUNT(*) as total 
        FROM rol_permisos 
        WHERE rol_id = 1
      `);
      
      console.log('📊 Total permisos asignados:', verifyResult.rows[0].total);
      
      // Mostrar algunos permisos asignados
      const sampleResult = await client.query(`
        SELECT p.nombre
        FROM permisos p
        INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
        WHERE rp.rol_id = 1
        ORDER BY p.nombre
        LIMIT 10
      `);
      
      console.log('\n🔑 Primeros 10 permisos asignados:');
      sampleResult.rows.forEach(permiso => {
        console.log(`   - ${permiso.nombre}`);
      });
      
    } else {
      console.log('✅ El rol ya tiene permisos asignados');
      
      // Mostrar permisos existentes
      const existingResult = await client.query(`
        SELECT p.nombre
        FROM permisos p
        INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
        WHERE rp.rol_id = 1
        ORDER BY p.nombre
        LIMIT 10
      `);
      
      console.log('\n🔑 Primeros 10 permisos existentes:');
      existingResult.rows.forEach(permiso => {
        console.log(`   - ${permiso.nombre}`);
      });
    }
    
    client.release();
    
    console.log('\n✅ Proceso completado');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

assignPermissions();
