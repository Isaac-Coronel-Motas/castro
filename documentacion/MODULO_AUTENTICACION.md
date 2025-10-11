# Módulo de Autenticación

## Descripción General

El módulo de Autenticación gestiona la seguridad y acceso al sistema, incluyendo login, logout, gestión de sesiones, tokens JWT, middleware de seguridad y protección de rutas.

## Funcionalidades Principales

### 🔐 Autenticación de Usuarios
- **Login de usuarios**: Autenticación con username/email y password
- **Logout de usuarios**: Cierre de sesión y invalidación de tokens
- **Renovación de tokens**: Refresh automático de tokens JWT
- **Validación de sesión**: Verificación de sesiones activas
- **Recuperación de contraseña**: Proceso de reset de contraseñas
- **Cambio de contraseña**: Actualización de contraseñas por usuarios

### 🛡️ Gestión de Tokens JWT
- **Generación de tokens**: Creación de tokens de acceso y refresh
- **Validación de tokens**: Verificación de integridad y expiración
- **Renovación de tokens**: Proceso de refresh de tokens expirados
- **Invalidación de tokens**: Revocación de tokens específicos
- **Blacklist de tokens**: Lista de tokens revocados
- **Auditoría de tokens**: Registro de uso de tokens

### 🔒 Middleware de Seguridad
- **Verificación de permisos**: Validación de permisos por ruta
- **Protección de rutas**: Control de acceso a endpoints
- **Rate limiting**: Limitación de requests por usuario/IP
- **Validación de headers**: Verificación de headers de seguridad
- **CORS configuration**: Configuración de Cross-Origin Resource Sharing
- **Security headers**: Headers de seguridad HTTP

### 🚪 Protección de Rutas
- **Rutas públicas**: Endpoints accesibles sin autenticación
- **Rutas protegidas**: Endpoints que requieren autenticación
- **Rutas administrativas**: Endpoints que requieren permisos especiales
- **Redirección automática**: Redirección a login cuando es necesario
- **Guard de rutas**: Protección a nivel de componente
- **Lazy loading**: Carga diferida de rutas protegidas

### 📊 Auditoría de Seguridad
- **Registro de accesos**: Log de intentos de login exitosos y fallidos
- **Registro de acciones**: Log de acciones realizadas por usuarios
- **Detección de intrusiones**: Identificación de patrones sospechosos
- **Alertas de seguridad**: Notificaciones de eventos de seguridad
- **Reportes de seguridad**: Análisis de actividad de seguridad
- **Exportación de logs**: Descarga de registros de seguridad

## Estructura de Archivos

```
app/
├── login/
│   └── page.tsx              # Página de login
├── register/
│   └── page.tsx              # Página de registro
└── api/auth/
    ├── login/
    │   └── route.ts          # Endpoint de login
    ├── logout/
    │   └── route.ts          # Endpoint de logout
    ├── me/
    │   └── route.ts          # Información del usuario actual
    └── refresh/
        └── route.ts          # Renovación de tokens

contexts/
└── auth-context.tsx          # Contexto de autenticación

components/
├── protected-route.tsx       # Componente de protección de rutas
└── ui/
    ├── login-form.tsx        # Formulario de login
    └── register-form.tsx     # Formulario de registro

lib/
├── middleware/
│   └── auth.ts              # Middleware de autenticación
└── utils/
    ├── jwt.ts               # Utilidades de JWT
    └── security.ts          # Utilidades de seguridad

hooks/
├── use-auth.ts              # Hook de autenticación
└── use-authenticated-fetch.ts # Hook de fetch autenticado

types/
└── auth.ts                  # Tipos de autenticación
```

## APIs Principales

### Login

#### POST `/api/auth/login`
Autentica un usuario y genera tokens JWT.

**Body:**
```typescript
{
  username: string;
  password: string;
  remember?: boolean;
}
```

**Respuesta Exitosa:**
```typescript
{
  success: true;
  message: string;
  data: {
    user: {
      usuario_id: number;
      username: string;
      email: string;
      nombre: string;
      apellido: string;
      rol_id: number;
      rol_nombre: string;
      permisos: string[];
    };
    tokens: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
  };
}
```

**Respuesta de Error:**
```typescript
{
  success: false;
  message: string;
  error: string;
  code?: string;
}
```

### Logout

#### POST `/api/auth/logout`
Cierra la sesión del usuario y revoca tokens.

**Headers:**
```typescript
{
  Authorization: string; // Bearer token
}
```

**Respuesta:**
```typescript
{
  success: true;
  message: string;
}
```

### Información del Usuario

#### GET `/api/auth/me`
Obtiene información del usuario autenticado.

**Headers:**
```typescript
{
  Authorization: string; // Bearer token
}
```

**Respuesta:**
```typescript
{
  success: true;
  data: {
    usuario_id: number;
    username: string;
    email: string;
    nombre: string;
    apellido: string;
    rol_id: number;
    rol_nombre: string;
    sucursal_id?: number;
    sucursal_nombre?: string;
    permisos: string[];
    ultimo_acceso: string;
  };
}
```

### Renovación de Tokens

#### POST `/api/auth/refresh`
Renueva tokens de acceso usando refresh token.

**Body:**
```typescript
{
  refresh_token: string;
}
```

**Respuesta:**
```typescript
{
  success: true;
  data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}
```

## Componentes Principales

### AuthContext
Contexto de React para gestión de estado de autenticación.

**Funcionalidades:**
- Estado global de autenticación
- Funciones de login/logout
- Gestión de tokens
- Información del usuario
- Estados de carga y error

**Uso:**
```typescript
const { user, token, login, logout, loading, error } = useAuth();
```

### ProtectedRoute
Componente para protección de rutas.

**Props:**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}
```

**Funcionalidades:**
- Verificación de autenticación
- Validación de permisos
- Redirección automática
- Estados de carga
- Manejo de errores

### LoginForm
Formulario de login.

**Funcionalidades:**
- Validación de campos
- Manejo de errores
- Estados de carga
- Recordar usuario
- Redirección post-login

### RegisterForm
Formulario de registro.

**Funcionalidades:**
- Validación de campos
- Confirmación de contraseña
- Términos y condiciones
- Estados de carga
- Redirección post-registro

## Hooks Personalizados

### useAuth
Hook principal para autenticación.

```typescript
const {
  user,
  token,
  isAuthenticated,
  loading,
  error,
  login,
  logout,
  refreshToken,
  updateUser
} = useAuth();
```

**Funcionalidades:**
- Estado de autenticación
- Funciones de login/logout
- Gestión de tokens
- Actualización de usuario
- Manejo de errores

### useAuthenticatedFetch
Hook para requests autenticados.

```typescript
const {
  data,
  loading,
  error,
  fetchData,
  postData,
  putData,
  deleteData
} = useAuthenticatedFetch();
```

**Funcionalidades:**
- Requests automáticamente autenticados
- Manejo de tokens
- Renovación automática
- Estados de carga y error
- Retry automático

## Middleware de Seguridad

### requirePermission
Middleware para verificación de permisos.

```typescript
export async function requirePermission(
  request: NextRequest,
  permission: string
): Promise<NextResponse | null>;
```

**Funcionalidades:**
- Verificación de token JWT
- Validación de permisos
- Manejo de errores
- Logging de accesos
- Rate limiting

### validateToken
Función para validación de tokens JWT.

```typescript
export function validateToken(token: string): {
  valid: boolean;
  payload?: any;
  error?: string;
};
```

**Funcionalidades:**
- Verificación de firma
- Validación de expiración
- Extracción de payload
- Manejo de errores
- Blacklist checking

## Tipos TypeScript

### User
```typescript
interface User {
  usuario_id: number;
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  rol_id: number;
  rol_nombre: string;
  sucursal_id?: number;
  sucursal_nombre?: string;
  permisos: string[];
  ultimo_acceso: string;
}
```

### LoginRequest
```typescript
interface LoginRequest {
  username: string;
  password: string;
  remember?: boolean;
}
```

### LoginResponse
```typescript
interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    tokens: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
  };
  error?: string;
  code?: string;
}
```

### AuthContextType
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
}
```

### JWTPayload
```typescript
interface JWTPayload {
  usuario_id: number;
  username: string;
  email: string;
  rol_id: number;
  permisos: string[];
  iat: number;
  exp: number;
}
```

## Configuración de Seguridad

### Variables de Entorno
```env
JWT_SECRET=your-super-secret-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=taller-castro
JWT_AUDIENCE=taller-castro-users

SESSION_TIMEOUT=3600
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900

RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100

CORS_ORIGINS=http://localhost:3000,https://taller-castro.com
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_HEADERS=Content-Type,Authorization
```

### Configuración JWT
```typescript
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET!,
  accessTokenExpiresIn: '15m',
  refreshTokenExpiresIn: '7d',
  issuer: 'taller-castro',
  audience: 'taller-castro-users',
  algorithm: 'HS256'
};
```

### Configuración de Seguridad
```typescript
const SECURITY_CONFIG = {
  sessionTimeout: 3600, // 1 hora
  maxLoginAttempts: 5,
  lockoutDuration: 900, // 15 minutos
  passwordMinLength: 8,
  passwordRequireSpecial: true,
  twoFactorAuth: false,
  rateLimitWindow: 900000, // 15 minutos
  rateLimitMaxRequests: 100
};
```

## Optimizaciones

### Performance
- **Token Caching**: Cache de tokens en memoria
- **Lazy Loading**: Carga diferida de componentes
- **Memoization**: Optimización de re-renders
- **Debounced Requests**: Requests optimizados

### Security
- **Token Rotation**: Rotación automática de tokens
- **HTTPS Only**: Forzar HTTPS en producción
- **Security Headers**: Headers de seguridad HTTP
- **Input Validation**: Validación de entrada
- **SQL Injection Prevention**: Prevención de inyección SQL

### Caching
- **Client-side**: Cache de tokens en localStorage
- **Server-side**: Cache de sesiones
- **CDN**: Cache de assets estáticos

## Testing

### Unit Tests
```typescript
describe('AuthContext', () => {
  it('should login user', async () => {
    // Test implementation
  });
  
  it('should logout user', async () => {
    // Test implementation
  });
  
  it('should refresh token', async () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
describe('Auth API', () => {
  it('should authenticate user', async () => {
    // Test implementation
  });
  
  it('should reject invalid credentials', async () => {
    // Test implementation
  });
  
  it('should refresh tokens', async () => {
    // Test implementation
  });
});
```

### Security Tests
```typescript
describe('Security', () => {
  it('should prevent SQL injection', async () => {
    // Test implementation
  });
  
  it('should validate JWT tokens', async () => {
    // Test implementation
  });
  
  it('should enforce rate limits', async () => {
    // Test implementation
  });
});
```

## Troubleshooting

### Problemas Comunes

1. **Login falla**
   - Verificar credenciales
   - Revisar configuración JWT
   - Verificar conexión a base de datos
   - Revisar logs de error

2. **Tokens expiran rápido**
   - Verificar configuración de expiración
   - Implementar refresh automático
   - Revisar configuración de sesión

3. **Permisos no funcionan**
   - Verificar asignación de permisos
   - Revisar middleware de permisos
   - Verificar configuración de roles

### Logs de Debug
```typescript
console.log('User authenticated:', user);
console.log('Token generated:', token);
console.log('Permission checked:', permission);
console.log('Access granted:', granted);
```

## Roadmap

### Próximas Funcionalidades
- [ ] Autenticación de dos factores
- [ ] Integración con OAuth
- [ ] Biometría
- [ ] SSO (Single Sign-On)
- [ ] Análisis de seguridad
- [ ] Mobile app

### Mejoras Técnicas
- [ ] WebSockets para sesiones
- [ ] Advanced caching
- [ ] Performance monitoring
- [ ] Error tracking
- [ ] Security analytics
