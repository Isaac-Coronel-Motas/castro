#!/usr/bin/env node

/**
 * Script para verificar permisos de referencias
 */

const { Pool } = require('pg');

// Configuración de conexión
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function checkReferencesPermissions() {
  try {
    console.log('🔍 Verificando permisos de referencias...\n');
    
    const client = await pool.connect();
    
    // Buscar permisos relacionados con referencias
    const result = await client.query(`
      SELECT permiso_id, nombre, descripcion, activo
      FROM permisos 
      WHERE nombre ILIKE '%referencia%' OR nombre ILIKE '%categoria%' OR nombre ILIKE '%marca%' OR nombre ILIKE '%producto%' OR nombre ILIKE '%cliente%' OR nombre ILIKE '%proveedor%'
      ORDER BY nombre
    `);
    
    console.log('📋 Permisos relacionados con referencias:');
    result.rows.forEach(permiso => {
      console.log(`   ${permiso.permiso_id}: ${permiso.nombre} - ${permiso.descripcion} (${permiso.activo ? 'activo' : 'inactivo'})`);
    });
    
    // Verificar permisos del rol administrador
    const adminResult = await client.query(`
      SELECT p.nombre
      FROM permisos p
      INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
      WHERE rp.rol_id = 1 AND p.activo = true
      ORDER BY p.nombre
    `);
    
    console.log(`\n🔑 Permisos del rol Administrador (${adminResult.rows.length} total):`);
    adminResult.rows.forEach(permiso => {
      console.log(`   - ${permiso.nombre}`);
    });
    
    // Verificar específicamente permisos de referencias en el rol administrador
    const referencesInAdmin = adminResult.rows.filter(p => 
      p.nombre.includes('referencia') || 
      p.nombre.includes('categoria') || 
      p.nombre.includes('marca') || 
      p.nombre.includes('producto') || 
      p.nombre.includes('cliente') || 
      p.nombre.includes('proveedor')
    );
    
    console.log(`\n🎯 Permisos de referencias en rol Administrador (${referencesInAdmin.length} encontrados):`);
    referencesInAdmin.forEach(permiso => {
      console.log(`   ✅ ${permiso.nombre}`);
    });
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkReferencesPermissions();
