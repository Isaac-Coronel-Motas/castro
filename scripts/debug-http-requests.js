#!/usr/bin/env node

/**
 * Script para debuggear las peticiones HTTP y verificar el token
 */

const jwt = require('jsonwebtoken');

// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function debugHttpRequests() {
  try {
    console.log('🔍 Debuggeando peticiones HTTP...\n');
    
    // Generar token válido para pruebas
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
    console.log('🔑 Token generado para pruebas:');
    console.log(`   ${token.substring(0, 50)}...`);
    
    // URLs de las APIs
    const baseUrl = 'http://localhost:3000';
    const endpoints = [
      '/api/usuarios?page=1&limit=10&sort_by=created_at&sort_order=desc',
      '/api/roles?page=1&limit=10&sort_by=created_at&sort_order=desc'
    ];
    
    console.log(`\n🌐 Probando endpoints en ${baseUrl}:`);
    
    for (const endpoint of endpoints) {
      console.log(`\n📡 Probando: ${endpoint}`);
      
      try {
        // Probar con token válido
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
        
        // Probar sin token para comparar
        console.log(`\n   🔍 Probando SIN token:`);
        const responseNoToken = await fetch(`${baseUrl}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log(`   Status sin token: ${responseNoToken.status} ${responseNoToken.statusText}`);
        
        if (responseNoToken.status === 403) {
          const errorData = await responseNoToken.json();
          console.log(`   📝 Mensaje sin token: ${errorData.message || 'Sin mensaje'}`);
        }
        
      } catch (fetchError) {
        console.log(`   ❌ Error de conexión: ${fetchError.message}`);
        console.log(`   💡 Asegúrate de que la aplicación esté corriendo en localhost:3000`);
      }
    }
    
    console.log('\n📋 Análisis:');
    console.log('   - Si las peticiones CON token devuelven 403:');
    console.log('     → El problema está en el backend/middleware');
    console.log('   - Si las peticiones SIN token devuelven 403:');
    console.log('     → El backend está funcionando correctamente');
    console.log('   - Si las peticiones CON token devuelven 200:');
    console.log('     → El problema está en el frontend (token no se envía)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugHttpRequests();
