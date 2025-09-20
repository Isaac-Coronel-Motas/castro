#!/usr/bin/env node

/**
 * Script para verificar permisos faltantes de productos y proveedores
 */

const { Pool } = require('pg');

// Configuración de conexión
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function checkMissingPermissions() {
  try {
    console.log('🔍 Verificando permisos faltantes...\n');
    
    const client = await pool.connect();
    
    // Buscar permisos de productos y proveedores
    const result = await client.query(`
      SELECT permiso_id, nombre, descripcion, activo
      FROM permisos 
      WHERE nombre ILIKE '%producto%' OR nombre ILIKE '%proveedor%'
      ORDER BY nombre
    `);
    
    console.log('📋 Permisos de productos y proveedores:');
    result.rows.forEach(permiso => {
      console.log(`   ${permiso.permiso_id}: ${permiso.nombre} - ${permiso.descripcion} (${permiso.activo ? 'activo' : 'inactivo'})`);
    });
    
    // Verificar permisos del rol administrador
    const adminResult = await client.query(`
      SELECT p.nombre
      FROM permisos p
      INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
      WHERE rp.rol_id = 1 AND p.activo = true
      AND (p.nombre ILIKE '%producto%' OR p.nombre ILIKE '%proveedor%')
      ORDER BY p.nombre
    `);
    
    console.log(`\n🔑 Permisos de productos/proveedores en rol Administrador (${adminResult.rows.length} total):`);
    adminResult.rows.forEach(permiso => {
      console.log(`   ✅ ${permiso.nombre}`);
    });
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkMissingPermissions();
