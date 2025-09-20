#!/usr/bin/env node

/**
 * Script simple para verificar permisos en Neon Database
 */

const { Pool } = require('pg');

// Configuración de conexión
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function checkPermissions() {
  try {
    console.log('🔍 Verificando permisos en la base de datos...\n');
    
    const client = await pool.connect();
    
    // Verificar permisos existentes
    const permisosResult = await client.query(`
      SELECT permiso_id, nombre, descripcion, activo 
      FROM permisos 
      WHERE activo = true 
      ORDER BY permiso_id
    `);
    
    console.log('📋 Permisos existentes:');
    permisosResult.rows.forEach(permiso => {
      console.log(`   ${permiso.permiso_id}: ${permiso.nombre} - ${permiso.descripcion}`);
    });
    
    // Verificar roles
    const rolesResult = await client.query(`
      SELECT rol_id, nombre, descripcion, activo 
      FROM roles 
      WHERE activo = true 
      ORDER BY rol_id
    `);
    
    console.log('\n👥 Roles existentes:');
    rolesResult.rows.forEach(rol => {
      console.log(`   ${rol.rol_id}: ${rol.nombre} - ${rol.descripcion}`);
    });
    
    // Verificar permisos del rol administrador
    const adminPermisosResult = await client.query(`
      SELECT p.nombre
      FROM permisos p
      INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
      WHERE rp.rol_id = 1 AND p.activo = true
      ORDER BY p.nombre
    `);
    
    console.log('\n🔑 Permisos del rol Administrador (ID: 1):');
    adminPermisosResult.rows.forEach(permiso => {
      console.log(`   - ${permiso.nombre}`);
    });
    
    // Verificar usuario administrador
    const adminUserResult = await client.query(`
      SELECT usuario_id, nombre, username, email, rol_id, activo
      FROM usuarios 
      WHERE username = 'admin'
    `);
    
    console.log('\n👤 Usuario administrador:');
    if (adminUserResult.rows.length > 0) {
      const user = adminUserResult.rows[0];
      console.log(`   ID: ${user.usuario_id}`);
      console.log(`   Nombre: ${user.nombre}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Rol ID: ${user.rol_id}`);
      console.log(`   Activo: ${user.activo}`);
    } else {
      console.log('   ❌ Usuario administrador no encontrado');
    }
    
    client.release();
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPermissions();
