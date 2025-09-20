#!/usr/bin/env node

/**
 * Script para verificar el token del frontend y compararlo con el backend
 */

const jwt = require('jsonwebtoken');

// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function verifyFrontendToken() {
  try {
    console.log('🔍 Verificando token del frontend...\n');
    
    // 1. Hacer login para obtener el token del backend
    console.log('1️⃣ Obteniendo token del backend...');
    
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin.2025',
        remember_me: false
      }),
    });
    
    if (loginResponse.status !== 200) {
      console.log('❌ Error en login:', loginResponse.status);
      return;
    }
    
    const loginData = await loginResponse.json();
    const backendToken = loginData.data.token;
    
    console.log('✅ Token del backend obtenido');
    console.log(`   Token: ${backendToken.substring(0, 50)}...`);
    
    // 2. Verificar el token del backend
    console.log('\n2️⃣ Verificando token del backend...');
    
    try {
      const decodedBackend = jwt.verify(backendToken, JWT_SECRET);
      console.log('✅ Token del backend válido');
      console.log(`   Usuario ID: ${decodedBackend.usuario_id}`);
      console.log(`   Username: ${decodedBackend.username}`);
      console.log(`   Rol ID: ${decodedBackend.rol_id}`);
      console.log(`   Permisos: ${decodedBackend.permisos.length} permisos`);
      
      // Mostrar permisos específicos
      const hasUsuariosLeer = decodedBackend.permisos.includes('usuarios.leer');
      const hasRolesLeer = decodedBackend.permisos.includes('roles.leer');
      
      console.log(`\n🎯 Permisos específicos del backend:`);
      console.log(`   usuarios.leer: ${hasUsuariosLeer ? '✅' : '❌'}`);
      console.log(`   roles.leer: ${hasRolesLeer ? '✅' : '❌'}`);
      
      // Mostrar todos los permisos
      console.log(`\n📋 Todos los permisos del backend:`);
      decodedBackend.permisos.forEach((permiso, index) => {
        console.log(`   ${index + 1}. ${permiso}`);
      });
      
    } catch (error) {
      console.log(`❌ Error verificando token del backend: ${error.message}`);
      return;
    }
    
    // 3. Probar las APIs con el token del backend
    console.log('\n3️⃣ Probando APIs con token del backend...');
    
    const endpoints = [
      '/api/usuarios?page=1&limit=10&sort_by=created_at&sort_order=desc',
      '/api/roles?page=1&limit=10&sort_by=created_at&sort_order=desc'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n📡 Probando: ${endpoint}`);
      
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${backendToken}`,
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
      }
    }
    
    // 4. Simular el proceso del frontend
    console.log('\n4️⃣ Simulando proceso del frontend...');
    
    // Simular que el frontend guarda el token en localStorage
    console.log('   📱 Frontend guarda token en localStorage');
    
    // Simular que el frontend carga el token del localStorage
    console.log('   📱 Frontend carga token del localStorage');
    
    // Simular que el frontend envía el token
    console.log('   📱 Frontend envía token en Authorization header');
    
    // Verificar que el token es el mismo
    console.log(`   🔍 Token enviado: ${backendToken.substring(0, 50)}...`);
    console.log(`   🔍 Token recibido: ${backendToken.substring(0, 50)}...`);
    console.log(`   ✅ Tokens coinciden: ${backendToken === backendToken ? 'Sí' : 'No'}`);
    
    console.log('\n📋 Resumen:');
    console.log('   - Si el token del backend funciona:');
    console.log('     → El problema está en el frontend (token diferente)');
    console.log('   - Si el token del backend NO funciona:');
    console.log('     → El problema está en el backend/middleware');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyFrontendToken();
