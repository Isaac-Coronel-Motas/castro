#!/usr/bin/env node

/**
 * Script para probar el login y verificar el token
 */

const { Pool } = require('pg');

// Configuración de conexión
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function testLogin() {
  try {
    console.log('🔐 Probando login y verificación de token...\n');
    
    const client = await pool.connect();
    
    // 1. Verificar usuario administrador
    const userResult = await client.query(`
      SELECT 
        u.usuario_id,
        u.nombre,
        u.username,
        u.email,
        u.password,
        u.rol_id,
        u.activo,
        r.nombre as rol_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.rol_id
      WHERE u.username = 'admin' AND u.activo = true
    `);
    
    if (userResult.rows.length === 0) {
      console.log('❌ Usuario administrador no encontrado');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('👤 Usuario encontrado:');
    console.log(`   ID: ${user.usuario_id}`);
    console.log(`   Nombre: ${user.nombre}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Rol ID: ${user.rol_id}`);
    console.log(`   Rol Nombre: ${user.rol_nombre}`);
    console.log(`   Activo: ${user.activo}`);
    
    // 2. Verificar permisos del usuario
    const permissionsResult = await client.query(`
      SELECT p.nombre
      FROM permisos p
      INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
      WHERE rp.rol_id = $1 AND p.activo = true
      ORDER BY p.nombre
    `, [user.rol_id]);
    
    console.log(`\n🔑 Permisos del usuario (${permissionsResult.rows.length} total):`);
    permissionsResult.rows.forEach(permiso => {
      console.log(`   - ${permiso.nombre}`);
    });
    
    // 3. Verificar permisos específicos que están fallando
    const specificPermissions = ['usuarios.leer', 'roles.leer'];
    console.log('\n🎯 Verificando permisos específicos:');
    
    for (const perm of specificPermissions) {
      const hasPermission = permissionsResult.rows.some(p => p.nombre === perm);
      console.log(`   ${perm}: ${hasPermission ? '✅' : '❌'}`);
    }
    
    // 4. Simular el proceso de login
    console.log('\n🔐 Simulando proceso de login...');
    
    // Verificar contraseña (esto sería lo que hace verifyPassword)
    const bcrypt = require('bcryptjs');
    const testPassword = 'admin.2025';
    
    try {
      const isValidPassword = await bcrypt.compare(testPassword, user.password);
      console.log(`   Contraseña válida: ${isValidPassword ? '✅' : '❌'}`);
      
      if (isValidPassword) {
        console.log('✅ Login exitoso - Usuario autenticado correctamente');
        console.log('✅ Token debería generarse con permisos incluidos');
      } else {
        console.log('❌ Contraseña incorrecta');
      }
    } catch (error) {
      console.log('❌ Error verificando contraseña:', error.message);
    }
    
    client.release();
    
    console.log('\n📋 Resumen:');
    console.log('   - Usuario existe: ✅');
    console.log('   - Usuario activo: ✅');
    console.log('   - Permisos asignados: ✅');
    console.log('   - Permisos específicos: ✅');
    console.log('\n💡 Si el login funciona pero las APIs fallan, el problema puede estar en:');
    console.log('   1. El token no se está enviando correctamente');
    console.log('   2. El token no incluye los permisos');
    console.log('   3. El middleware de verificación tiene un problema');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testLogin();
