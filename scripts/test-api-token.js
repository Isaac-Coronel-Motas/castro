#!/usr/bin/env node

/**
 * Script para probar las APIs directamente con un token válido
 */

const jwt = require('jsonwebtoken');

// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

async function testApiWithToken() {
  try {
    console.log('🌐 Probando APIs con token válido...\n');
    
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
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    console.log('🔑 Token generado exitosamente');
    
    // URLs de las APIs (asumiendo que la app corre en localhost:3000)
    const baseUrl = 'http://localhost:3000';
    const endpoints = [
      '/api/usuarios?page=1&limit=10&sort_by=created_at&sort_order=desc',
      '/api/roles?page=1&limit=10&sort_by=created_at&sort_order=desc'
    ];
    
    console.log(`\n🔍 Probando endpoints en ${baseUrl}:`);
    
    for (const endpoint of endpoints) {
      try {
        console.log(`\n📡 Probando: ${endpoint}`);
        
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.status === 200) {
          const data = await response.json();
          console.log(`   ✅ Éxito: ${data.success ? 'true' : 'false'}`);
          if (data.data) {
            console.log(`   📊 Datos: ${data.data.length} elementos`);
          }
        } else if (response.status === 403) {
          console.log(`   ❌ Error 403: No autorizado`);
          const errorData = await response.json();
          console.log(`   📝 Mensaje: ${errorData.message || 'Sin mensaje'}`);
        } else {
          console.log(`   ⚠️  Status inesperado: ${response.status}`);
          const errorData = await response.text();
          console.log(`   📝 Respuesta: ${errorData.substring(0, 100)}...`);
        }
        
      } catch (fetchError) {
        console.log(`   ❌ Error de conexión: ${fetchError.message}`);
        console.log(`   💡 Asegúrate de que la aplicación esté corriendo en localhost:3000`);
      }
    }
    
    console.log('\n📋 Resumen:');
    console.log('   - Token generado: ✅');
    console.log('   - Token válido: ✅');
    console.log('   - Permisos incluidos: ✅');
    console.log('\n💡 Si las APIs siguen devolviendo 403:');
    console.log('   1. Verifica que la aplicación esté corriendo');
    console.log('   2. Revisa los logs del servidor para ver qué está pasando');
    console.log('   3. El problema puede estar en el middleware de autenticación');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testApiWithToken();
