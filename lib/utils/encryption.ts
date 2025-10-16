import CryptoJS from 'crypto-js'

// Clave de encriptación - En producción debería estar en variables de entorno
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'castro-taller-2025-secret-key'

/**
 * Genera una clave usando PBKDF2 (compatible con Node.js crypto)
 */
function getKeyFromPassword(password: string): CryptoJS.lib.WordArray {
  return CryptoJS.PBKDF2(password, 'salt', {
    keySize: 256/32,
    iterations: 1000
  })
}

/**
 * Encripta un texto usando AES-256-CBC (compatible con Node.js crypto)
 */
export function encrypt(text: string): string {
  try {
    const key = getKeyFromPassword(ENCRYPTION_KEY)
    const iv = CryptoJS.lib.WordArray.random(128/8)
    const encrypted = CryptoJS.AES.encrypt(text, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    
    // Combinar IV con texto encriptado (formato: iv:encrypted en hex)
    return iv.toString(CryptoJS.enc.Hex) + ':' + encrypted.ciphertext.toString(CryptoJS.enc.Hex)
  } catch (error) {
    console.error('Error encriptando texto:', error)
    throw new Error('Error en la encriptación')
  }
}

/**
 * Desencripta un texto usando AES-256-CBC (compatible con Node.js crypto)
 */
export function decrypt(encryptedText: string): string {
  try {
    const textParts = encryptedText.split(':')
    if (textParts.length !== 2) {
      throw new Error('Formato de texto encriptado inválido')
    }
    
    const key = getKeyFromPassword(ENCRYPTION_KEY)
    const iv = CryptoJS.enc.Hex.parse(textParts[0])
    const encryptedData = CryptoJS.enc.Hex.parse(textParts[1])
    
    const decrypted = CryptoJS.AES.decrypt({ ciphertext: encryptedData }, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    
    const result = decrypted.toString(CryptoJS.enc.Utf8)
    
    if (!result) {
      throw new Error('Texto encriptado inválido')
    }
    
    return result
  } catch (error) {
    console.error('Error desencriptando texto:', error)
    throw new Error('Error en la desencriptación')
  }
}

/**
 * Encripta las credenciales de login
 */
export function encryptCredentials(username: string, password: string): { encryptedUsername: string; encryptedPassword: string } {
  return {
    encryptedUsername: encrypt(username),
    encryptedPassword: encrypt(password)
  }
}

/**
 * Desencripta las credenciales de login
 */
export function decryptCredentials(encryptedUsername: string, encryptedPassword: string): { username: string; password: string } {
  return {
    username: decrypt(encryptedUsername),
    password: decrypt(encryptedPassword)
  }
}

/**
 * Genera una clave de encriptación aleatoria (para uso en desarrollo)
 */
export function generateEncryptionKey(): string {
  return CryptoJS.lib.WordArray.random(256/8).toString()
}
