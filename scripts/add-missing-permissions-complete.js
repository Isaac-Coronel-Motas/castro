#!/usr/bin/env node

/**
 * Script para agregar permisos faltantes completos
 */

const { Pool } = require('pg');
const fs = require('fs');

// Configuración de conexión
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function addMissingPermissions() {
  try {
    console.log('🔧 Agregando permisos faltantes completos...\n');
    
    const client = await pool.connect();
    
    // Leer el script SQL
    const sqlScript = fs.readFileSync('add_missing_permissions_complete.sql', 'utf8');
    
    // Ejecutar el script
    await client.query(sqlScript);
    
    console.log('✅ Permisos faltantes agregados exitosamente');
    
    // Verificar que se agregaron
    const result = await client.query(`
      SELECT permiso_id, nombre, descripcion
      FROM permisos 
      WHERE permiso_id BETWEEN 58 AND 73
      ORDER BY permiso_id
    `);
    
    console.log(`\n📋 Permisos agregados (${result.rows.length} total):`);
    result.rows.forEach(permiso => {
      console.log(`   ${permiso.permiso_id}: ${permiso.nombre} - ${permiso.descripcion}`);
    });
    
    // Verificar que se asignaron al rol administrador
    const adminResult = await client.query(`
      SELECT COUNT(*) as total
      FROM rol_permisos 
      WHERE rol_id = 1 AND permiso_id BETWEEN 58 AND 73
    `);
    
    console.log(`\n🔑 Permisos asignados al rol Administrador: ${adminResult.rows[0].total}`);
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addMissingPermissions();
