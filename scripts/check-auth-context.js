#!/usr/bin/env node

/**
 * Script para verificar el estado del contexto de autenticación
 */

const jwt = require('jsonwebtoken');

// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function checkAuthContext() {
  try {
    console.log('🔍 Verificando contexto de autenticación...\n');
    
    // Simular el proceso de login
    console.log('1️⃣ Simulando proceso de login...');
    
    const loginRequest = {
      username: 'admin',
      password: 'admin.2025',
      remember_me: false
    };
    
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginRequest),
    });
    
    if (loginResponse.status === 200) {
      const loginData = await loginResponse.json();
      console.log('✅ Login exitoso');
      console.log(`   Usuario: ${loginData.data.usuario.username}`);
      console.log(`   Token: ${loginData.data.token.substring(0, 50)}...`);
      console.log(`   Permisos: ${loginData.data.permisos.length} permisos`);
      
      const token = loginData.data.token;
      
      // Verificar el token
      console.log('\n2️⃣ Verificando token...');
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ Token válido');
        console.log(`   Usuario ID: ${decoded.usuario_id}`);
        console.log(`   Username: ${decoded.username}`);
        console.log(`   Rol ID: ${decoded.rol_id}`);
        console.log(`   Permisos: ${decoded.permisos.length} permisos`);
        
        // Verificar permisos específicos
        const hasUsuariosLeer = decoded.permisos.includes('usuarios.leer');
        const hasRolesLeer = decoded.permisos.includes('roles.leer');
        
        console.log(`\n🎯 Permisos específicos:`);
        console.log(`   usuarios.leer: ${hasUsuariosLeer ? '✅' : '❌'}`);
        console.log(`   roles.leer: ${hasRolesLeer ? '✅' : '❌'}`);
        
        // Probar las APIs con el token del login
        console.log('\n3️⃣ Probando APIs con token del login...');
        
        const endpoints = [
          '/api/usuarios?page=1&limit=10&sort_by=created_at&sort_order=desc',
          '/api/roles?page=1&limit=10&sort_by=created_at&sort_order=desc'
        ];
        
        for (const endpoint of endpoints) {
          console.log(`\n📡 Probando: ${endpoint}`);
          
          const response = await fetch(`http://localhost:3000${endpoint}`, {
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
          }
        }
        
      } catch (tokenError) {
        console.log(`❌ Error verificando token: ${tokenError.message}`);
      }
      
    } else {
      console.log('❌ Login falló');
      const errorData = await loginResponse.json();
      console.log(`   Error: ${errorData.message || 'Sin mensaje'}`);
    }
    
    console.log('\n📋 Resumen:');
    console.log('   - Si el login funciona y las APIs devuelven 200:');
    console.log('     → El backend está perfecto');
    console.log('   - Si el login funciona pero las APIs devuelven 403:');
    console.log('     → Hay un problema en el middleware');
    console.log('   - Si el login falla:');
    console.log('     → Hay un problema con las credenciales o la BD');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAuthContext();
