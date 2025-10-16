import crypto from 'crypto'

// Clave de encriptación - Debe coincidir con la del frontend
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'castro-taller-2025-secret-key'

/**
 * Convierte una clave de string a buffer usando PBKDF2 (compatible con crypto-js)
 */
function getKeyFromPassword(password: string): Buffer {
  return crypto.pbkdf2Sync(password, 'salt', 1000, 32, 'sha256')
}

/**
 * Encripta un texto usando AES-256-CBC (compatible con crypto-js)
 */
export function encrypt(text: string): string {
  try {
    const key = getKeyFromPassword(ENCRYPTION_KEY)
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    // Combinar IV con texto encriptado (formato: iv:encrypted)
    return iv.toString('hex') + ':' + encrypted
  } catch (error) {
    console.error('Error encriptando texto:', error)
    throw new Error('Error en la encriptación')
  }
}

/**
 * Desencripta un texto usando AES-256-CBC (compatible con crypto-js)
 */
export function decrypt(encryptedText: string): string {
  try {
    const textParts = encryptedText.split(':')
    if (textParts.length !== 2) {
      throw new Error('Formato de texto encriptado inválido')
    }
    
    const key = getKeyFromPassword(ENCRYPTION_KEY)
    const iv = Buffer.from(textParts[0], 'hex')
    const encryptedData = textParts[1]
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Error desencriptando texto:', error)
    throw new Error('Error en la desencriptación')
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
 * Genera una clave de encriptación aleatoria
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}
