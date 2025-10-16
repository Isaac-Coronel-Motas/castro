#!/usr/bin/env node

/**
 * Script de prueba para verificar el sistema de encriptación
 * Ejecutar con: node test-encryption.js
 */

const crypto = require('crypto');

// Simular las funciones de encriptación del servidor
const ENCRYPTION_KEY = 'castro-taller-2025-secret-key';
const ALGORITHM = 'aes-256-cbc';

function encrypt(text) {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Error encriptando texto:', error);
    throw new Error('Error en la encriptación');
  }
}

function decrypt(encryptedText) {
  try {
    const textParts = encryptedText.split(':');
    if (textParts.length !== 2) {
      throw new Error('Formato de texto encriptado inválido');
    }
    
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedData = textParts[1];
    
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error desencriptando texto:', error);
    throw new Error('Error en la desencriptación');
  }
}

// Pruebas
console.log('🔐 Prueba del Sistema de Encriptación\n');

const testCredentials = {
  username: 'admin',
  password: 'admin.2025'
};

console.log('📝 Credenciales originales:');
console.log('   Username:', testCredentials.username);
console.log('   Password:', testCredentials.password);
console.log('');

try {
  // Encriptar
  const encryptedUsername = encrypt(testCredentials.username);
  const encryptedPassword = encrypt(testCredentials.password);
  
  console.log('🔒 Credenciales encriptadas:');
  console.log('   Username:', encryptedUsername);
  console.log('   Password:', encryptedPassword);
  console.log('');
  
  // Desencriptar
  const decryptedUsername = decrypt(encryptedUsername);
  const decryptedPassword = decrypt(encryptedPassword);
  
  console.log('🔓 Credenciales desencriptadas:');
  console.log('   Username:', decryptedUsername);
  console.log('   Password:', decryptedPassword);
  console.log('');
  
  // Verificar
  const isValid = decryptedUsername === testCredentials.username && 
                  decryptedPassword === testCredentials.password;
  
  if (isValid) {
    console.log('✅ Prueba exitosa: Las credenciales coinciden');
  } else {
    console.log('❌ Prueba fallida: Las credenciales no coinciden');
  }
  
  console.log('\n📊 Estadísticas:');
  console.log('   Longitud username encriptado:', encryptedUsername.length);
  console.log('   Longitud password encriptado:', encryptedPassword.length);
  console.log('   Algoritmo:', ALGORITHM);
  console.log('   Clave:', ENCRYPTION_KEY.substring(0, 10) + '...');
  
} catch (error) {
  console.error('❌ Error en la prueba:', error.message);
}
