# Sistema de Encriptación de Credenciales

## Descripción

Este sistema implementa encriptación AES-256-CBC para proteger las credenciales de login durante la transmisión entre el frontend y el backend, evitando que las credenciales sean visibles en texto plano en las herramientas de desarrollador del navegador.

## Arquitectura

### Frontend (Cliente)
- **Archivo**: `lib/utils/encryption.ts`
- **Librería**: `crypto-js`
- **Algoritmo**: AES-256-CBC con PBKDF2
- **Formato**: `iv:encrypted` (IV separado por dos puntos)
- **Función**: Encripta username y password antes del envío

### Backend (Servidor)
- **Archivo**: `lib/utils/server-encryption.ts`
- **Librería**: `crypto` (Node.js nativo)
- **Algoritmo**: AES-256-CBC con PBKDF2
- **Formato**: `iv:encrypted` (IV separado por dos puntos)
- **Función**: Desencripta username y password antes de la validación

## Flujo de Encriptación

1. **Usuario ingresa credenciales** en el formulario de login
2. **Frontend encripta** username y password usando AES-256-CBC estándar
3. **Credenciales encriptadas** se envían al backend en formato Base64
4. **Backend desencripta** las credenciales usando el mismo algoritmo
5. **Validación normal** de usuario y contraseña
6. **Respuesta** con token JWT si las credenciales son válidas

## Configuración

### Variables de Entorno

```bash
# Frontend (pública)
NEXT_PUBLIC_ENCRYPTION_KEY=castro-taller-2025-secret-key

# Backend (privada)
ENCRYPTION_KEY=castro-taller-2025-secret-key
```

### Instalación de Dependencias

```bash
npm install crypto-js @types/crypto-js
```

## Uso

### Frontend

```typescript
import { encryptCredentials } from '@/lib/utils/encryption'

// Encriptar credenciales antes del envío
const { encryptedUsername, encryptedPassword } = encryptCredentials(username, password)

const loginRequest = {
  username: encryptedUsername,
  password: encryptedPassword,
  remember_me: rememberMe
}
```

### Backend

```typescript
import { decryptCredentials } from '@/lib/utils/server-encryption'

// Desencriptar credenciales recibidas
const { username, password } = decryptCredentials(encryptedUsername, encryptedPassword)
```

## Seguridad

### Ventajas
- ✅ Credenciales no visibles en texto plano en el navegador
- ✅ Protección durante la transmisión HTTP
- ✅ Implementación transparente para el usuario
- ✅ Compatible con HTTPS
- ✅ Uso de IV aleatorio para cada encriptación
- ✅ Algoritmo AES-256-CBC estándar y seguro

### Consideraciones
- ⚠️ La clave de encriptación debe ser segura y única
- ⚠️ En producción, usar claves diferentes para frontend y backend
- ⚠️ La clave del frontend es visible en el código cliente
- ⚠️ No reemplaza la necesidad de HTTPS en producción

## Implementación Actual

### Archivos Modificados

1. **`lib/utils/encryption.ts`** - Utilidades de encriptación para frontend (AES-256-CBC)
2. **`lib/utils/server-encryption.ts`** - Utilidades de desencriptación para backend (AES-256-CBC)
3. **`contexts/auth-context.tsx`** - Contexto de autenticación actualizado
4. **`app/api/auth/login/route.ts`** - API de login actualizada

### Funciones Principales

#### Frontend
- `encrypt(text: string): string` - Encripta un texto en formato Base64
- `decrypt(encryptedText: string): string` - Desencripta un texto en formato Base64
- `encryptCredentials(username: string, password: string)` - Encripta credenciales de login

#### Backend
- `encrypt(text: string): string` - Encripta un texto en formato Hex
- `decrypt(encryptedText: string): string` - Desencripta un texto en formato Hex
- `decryptCredentials(encryptedUsername: string, encryptedPassword: string)` - Desencripta credenciales de login

## Formato de Datos

### Estructura de Encriptación

#### Frontend (Base64)
```
Ejemplo: U2FsdGVkX1+vupppZksvRf5pq5g5XjFRlipRkwB0K1Y=
```

#### Backend (Hex)
```
Ejemplo: d4a413e1506c2f388cb7574d51d6feda
```

- **Frontend**: Formato Base64 estándar de crypto-js
- **Backend**: Formato Hex estándar de Node.js crypto
- **Algoritmo**: AES-256-CBC en ambos casos

### Longitudes Típicas
- Username encriptado: ~32 caracteres (Hex) / ~44 caracteres (Base64)
- Password encriptado: ~32 caracteres (Hex) / ~44 caracteres (Base64)

## Pruebas

Para verificar que el sistema funciona:

1. Abrir las herramientas de desarrollador del navegador
2. Ir a la pestaña "Network"
3. Intentar hacer login
4. Verificar que en el "Request Payload" las credenciales aparecen encriptadas en formato Base64
5. Confirmar que el login funciona correctamente

## Mantenimiento

### Cambio de Claves
Si es necesario cambiar las claves de encriptación:

1. Generar nuevas claves seguras
2. Actualizar las variables de entorno
3. Reiniciar la aplicación
4. Los usuarios existentes no se verán afectados

### Debugging
Para debuggear problemas de encriptación:

1. Verificar que las claves coincidan entre frontend y backend
2. Revisar los logs del servidor para errores de desencriptación
3. Verificar que las librerías estén instaladas correctamente
4. Comprobar que las variables de entorno estén configuradas
5. Verificar el formato de los datos encriptados (Base64 en frontend, Hex en backend)

## Resolución de Problemas

### Error: "Formato de texto encriptado inválido"
- Verificar que el formato sea Base64 en frontend y Hex en backend
- Comprobar que los datos encriptados no estén vacíos
- Verificar que no haya caracteres especiales en los datos

### Error: "Error en la desencriptación"
- Verificar que la clave de encriptación sea la misma en frontend y backend
- Comprobar que el algoritmo sea AES-256-CBC en ambos lados
- Verificar que el formato de codificación sea correcto (Base64/Hex)

### Error: "Texto encriptado inválido"
- Verificar que la clave de encriptación sea correcta
- Comprobar que el formato de los datos sea válido
- Verificar que no haya caracteres especiales en los datos

### Error: "wrong final block length"
- Verificar que la clave de encriptación sea la misma en frontend y backend
- Comprobar que el algoritmo sea AES-256-CBC en ambos lados
- Verificar que el padding sea compatible entre crypto-js y Node.js crypto
