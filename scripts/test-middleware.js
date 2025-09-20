#!/usr/bin/env node

/**
 * Script para probar el middleware de autenticación directamente
 */

const jwt = require('jsonwebtoken');

// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function simulateAuthenticateToken(authHeader) {
  console.log(`🔍 Simulando authenticateToken con header: "${authHeader}"`);
  
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    console.log('❌ No se encontró token en el header');
    return { user: null, error: 'Token de acceso requerido' };
  }
  
  console.log(`🔑 Token extraído: "${token.substring(0, 20)}..."`);
  
  try {
    const user = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token verificado exitosamente');
    console.log(`   Usuario ID: ${user.usuario_id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Rol ID: ${user.rol_id}`);
    console.log(`   Permisos: ${user.permisos ? user.permisos.length : 0} permisos`);
    
    if (user.permisos) {
      console.log('   Primeros 5 permisos:', user.permisos.slice(0, 5));
    }
    
    return { user, error: null };
  } catch (error) {
    console.log(`❌ Error verificando token: ${error.message}`);
    return { user: null, error: 'Token inválido o expirado' };
  }
}

function simulateRequirePermission(permission) {
  return function(authHeader) {
    console.log(`\n🔐 Simulando requirePermission para: "${permission}"`);
    
    const { user, error } = simulateAuthenticateToken(authHeader);
    
    if (error) {
      console.log(`❌ Error de autenticación: ${error}`);
      return { authorized: false, error };
    }

    if (!user) {
      console.log('❌ Usuario no autenticado');
      return { authorized: false, error: 'Usuario no autenticado' };
    }

    if (!user.permisos) {
      console.log('❌ Usuario no tiene permisos en el token');
      return { authorized: false, error: 'Usuario sin permisos' };
    }

    const hasPermission = user.permisos.includes(permission);
    console.log(`🎯 Tiene permiso "${permission}": ${hasPermission ? '✅' : '❌'}`);
    
    if (!hasPermission) {
      console.log(`❌ Permisos disponibles: ${user.permisos.join(', ')}`);
      return { authorized: false, error: 'No tiene permisos para realizar esta acción' };
    }

    console.log('✅ Autorizado');
    return { authorized: true, error: null };
  };
}

async function testMiddleware() {
  try {
    console.log('🧪 Probando middleware de autenticación...\n');
    
    // Generar token válido
    const tokenPayload = {
      usuario_id: 1,
      username: 'admin',
      email: 'admin@tallercastro.com',
      rol_id: 1,
      permisos: [
        'usuarios.leer',
        'usuarios.crear',
        'usuarios.actualizar',
        'usuarios.eliminar',
        'roles.leer',
        'roles.crear',
        'roles.actualizar',
        'roles.eliminar'
      ]
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });
    const authHeader = `Bearer ${token}`;
    
    console.log('🔑 Token generado exitosamente');
    console.log(`📋 Header: "${authHeader.substring(0, 30)}..."`);
    
    // Probar diferentes permisos
    const permissions = ['usuarios.leer', 'roles.leer', 'usuarios.crear', 'permisos.leer'];
    
    for (const permission of permissions) {
      const requirePermission = simulateRequirePermission(permission);
      const result = requirePermission(authHeader);
      
      console.log(`\n📊 Resultado para "${permission}":`);
      console.log(`   Autorizado: ${result.authorized ? '✅' : '❌'}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
    
    // Probar con header malformado
    console.log('\n🔍 Probando con header malformado:');
    const badHeaders = [
      'InvalidToken',
      'Bearer',
      'Token invalid-token',
      '',
      null
    ];
    
    for (const badHeader of badHeaders) {
      console.log(`\n📋 Probando header: "${badHeader}"`);
      const requirePermission = simulateRequirePermission('usuarios.leer');
      const result = requirePermission(badHeader);
      console.log(`   Resultado: ${result.authorized ? '✅' : '❌'} - ${result.error}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testMiddleware();
