#!/usr/bin/env node

/**
 * Script para probar la generación y verificación de tokens
 */

const jwt = require('jsonwebtoken');

// Configuración JWT (debe coincidir con la aplicación)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

async function testTokenGeneration() {
  try {
    console.log('🔐 Probando generación y verificación de tokens...\n');
    
    // Simular payload del usuario administrador
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
    
    console.log('📋 Payload del token:');
    console.log(JSON.stringify(tokenPayload, null, 2));
    
    // Generar token
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    console.log(`\n🔑 Token generado:`);
    console.log(token.substring(0, 50) + '...');
    
    // Verificar token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('\n✅ Token verificado exitosamente:');
      console.log(`   Usuario ID: ${decoded.usuario_id}`);
      console.log(`   Username: ${decoded.username}`);
      console.log(`   Rol ID: ${decoded.rol_id}`);
      console.log(`   Permisos: ${decoded.permisos.length} permisos`);
      
      // Verificar permisos específicos
      const hasUsuariosLeer = decoded.permisos.includes('usuarios.leer');
      const hasRolesLeer = decoded.permisos.includes('roles.leer');
      
      console.log(`\n🎯 Verificación de permisos específicos:`);
      console.log(`   usuarios.leer: ${hasUsuariosLeer ? '✅' : '❌'}`);
      console.log(`   roles.leer: ${hasRolesLeer ? '✅' : '❌'}`);
      
      if (hasUsuariosLeer && hasRolesLeer) {
        console.log('\n✅ Token válido con permisos correctos');
        console.log('💡 El problema puede estar en:');
        console.log('   1. El token no se está enviando en el header Authorization');
        console.log('   2. El middleware no está extrayendo el token correctamente');
        console.log('   3. Hay un problema en el formato del header');
      } else {
        console.log('\n❌ Token no tiene los permisos necesarios');
      }
      
    } catch (verifyError) {
      console.log('\n❌ Error verificando token:', verifyError.message);
    }
    
    // Probar con diferentes formatos de header
    console.log('\n🔍 Probando diferentes formatos de header:');
    
    const headers = [
      `Bearer ${token}`,
      `bearer ${token}`,
      `BEARER ${token}`,
      token, // Sin Bearer
      `Token ${token}`,
    ];
    
    headers.forEach((header, index) => {
      const extractedToken = header.split(' ')[1] || header;
      console.log(`   ${index + 1}. "${header.substring(0, 20)}..." -> Token: "${extractedToken.substring(0, 20)}..."`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTokenGeneration();
