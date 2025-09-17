import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ValidationResult, ValidationError, JwtPayload } from '@/lib/types/auth';

// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Configuración de seguridad
const BCRYPT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutos

/**
 * Encripta una contraseña usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verifica una contraseña contra su hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Genera un token JWT
 */
export function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Genera un refresh token
 */
export function generateRefreshToken(usuario_id: number): string {
  return jwt.sign({ usuario_id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

/**
 * Verifica un token JWT
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verifica un refresh token
 */
export function verifyRefreshToken(token: string): { usuario_id: number } | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { usuario_id: number };
  } catch (error) {
    return null;
  }
}

/**
 * Genera un secreto TOTP para autenticación de dos factores
 */
export function generateTotpSecret(): string {
  return crypto.randomBytes(16).toString('base32');
}

/**
 * Genera un código de verificación de 6 dígitos
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida formato de username
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
  return usernameRegex.test(username);
}

/**
 * Valida fortaleza de contraseña
 */
export function validatePasswordStrength(password: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (password.length < 8) {
    errors.push({ field: 'password', message: 'La contraseña debe tener al menos 8 caracteres' });
  }

  if (!/[A-Z]/.test(password)) {
    errors.push({ field: 'password', message: 'La contraseña debe contener al menos una letra mayúscula' });
  }

  if (!/[a-z]/.test(password)) {
    errors.push({ field: 'password', message: 'La contraseña debe contener al menos una letra minúscula' });
  }

  if (!/[0-9]/.test(password)) {
    errors.push({ field: 'password', message: 'La contraseña debe contener al menos un número' });
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push({ field: 'password', message: 'La contraseña debe contener al menos un carácter especial' });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida datos de usuario
 */
export function validateUsuarioData(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.nombre || data.nombre.trim().length < 2) {
    errors.push({ field: 'nombre', message: 'El nombre es requerido y debe tener al menos 2 caracteres' });
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.push({ field: 'email', message: 'El email es requerido y debe tener un formato válido' });
  }

  if (!data.username || !isValidUsername(data.username)) {
    errors.push({ field: 'username', message: 'El username es requerido y debe tener entre 3-50 caracteres alfanuméricos' });
  }

  if (data.password) {
    const passwordValidation = validatePasswordStrength(data.password);
    if (!passwordValidation.valid) {
      errors.push(...passwordValidation.errors);
    }
  }

  if (!data.rol_id || data.rol_id <= 0) {
    errors.push({ field: 'rol_id', message: 'El rol es requerido' });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida datos de rol
 */
export function validateRolData(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.nombre || data.nombre.trim().length < 2) {
    errors.push({ field: 'nombre', message: 'El nombre del rol es requerido y debe tener al menos 2 caracteres' });
  }

  if (data.permisos && (!Array.isArray(data.permisos) || data.permisos.length === 0)) {
    errors.push({ field: 'permisos', message: 'Debe seleccionar al menos un permiso' });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Valida datos de permiso
 */
export function validatePermisoData(data: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data.nombre || data.nombre.trim().length < 2) {
    errors.push({ field: 'nombre', message: 'El nombre del permiso es requerido y debe tener al menos 2 caracteres' });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Verifica si un usuario está bloqueado por intentos fallidos
 */
export function isUserLocked(failed_attempts: number, locked_until: string | null): boolean {
  if (failed_attempts >= MAX_LOGIN_ATTEMPTS && locked_until) {
    const lockTime = new Date(locked_until).getTime();
    const now = new Date().getTime();
    return now < lockTime;
  }
  return false;
}

/**
 * Calcula el tiempo de bloqueo
 */
export function calculateLockoutTime(): Date {
  return new Date(Date.now() + LOCKOUT_TIME);
}

/**
 * Genera un hash seguro para auditoría
 */
export function generateAuditHash(data: any): string {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

/**
 * Sanitiza datos sensibles para logs
 */
export function sanitizeForLog(data: any): any {
  const sanitized = { ...data };
  delete sanitized.password;
  delete sanitized.password_hash;
  delete sanitized.totp_secret;
  delete sanitized.two_factor_secret;
  return sanitized;
}
