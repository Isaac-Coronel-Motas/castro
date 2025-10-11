# Módulo de Administración

## Descripción General

El módulo de Administración gestiona la configuración y administración del sistema, incluyendo usuarios, roles, permisos, auditoría y configuración general del sistema.

## Funcionalidades Principales

### 👥 Gestión de Usuarios
- **Creación de usuarios**: Registro de nuevos usuarios del sistema
- **Edición de usuarios**: Modificación de información de usuarios existentes
- **Asignación de roles**: Vinculación de usuarios con roles específicos
- **Estados de usuario**: Activo, Inactivo, Suspendido, Bloqueado
- **Información personal**: Datos personales y de contacto
- **Historial de cambios**: Auditoría de modificaciones de usuarios

### 🔐 Gestión de Roles
- **Creación de roles**: Definición de roles del sistema
- **Edición de roles**: Modificación de roles existentes
- **Asignación de permisos**: Vinculación de roles con permisos específicos
- **Jerarquía de roles**: Estructura jerárquica de roles
- **Estados de rol**: Activo, Inactivo
- **Historial de cambios**: Auditoría de modificaciones de roles

### 🛡️ Gestión de Permisos
- **Creación de permisos**: Definición de permisos específicos
- **Edición de permisos**: Modificación de permisos existentes
- **Categorización de permisos**: Agrupación por módulos
- **Estados de permiso**: Activo, Inactivo
- **Asignación automática**: Permisos heredados por roles
- **Historial de cambios**: Auditoría de modificaciones de permisos

### 📊 Auditoría del Sistema
- **Registro de accesos**: Log de accesos al sistema
- **Registro de acciones**: Log de acciones realizadas por usuarios
- **Registro de cambios**: Log de modificaciones en datos
- **Estadísticas de uso**: Métricas de uso del sistema
- **Reportes de auditoría**: Análisis de actividad del sistema
- **Exportación de logs**: Descarga de registros de auditoría

### ⚙️ Configuración del Sistema
- **Parámetros generales**: Configuración global del sistema
- **Configuración de módulos**: Parámetros específicos por módulo
- **Configuración de seguridad**: Parámetros de seguridad
- **Configuración de notificaciones**: Parámetros de notificaciones
- **Configuración de reportes**: Parámetros de generación de reportes
- **Backup y restauración**: Gestión de respaldos del sistema

## Estructura de Archivos

```
app/administracion/
├── usuarios/
│   ├── page.tsx              # Lista de usuarios
│   └── loading.tsx           # Estado de carga
├── roles-permisos/
│   ├── page.tsx              # Gestión de roles y permisos
│   └── loading.tsx           # Estado de carga
├── auditoria/
│   ├── page.tsx              # Auditoría del sistema
│   └── loading.tsx           # Estado de carga
└── configuracion/
    ├── page.tsx              # Configuración del sistema
    └── loading.tsx           # Estado de carga

app/api/
├── usuarios/
│   ├── route.ts              # CRUD de usuarios
│   └── [id]/
│       └── route.ts          # Operaciones específicas
├── roles/
│   ├── route.ts              # CRUD de roles
│   └── [id]/
│       └── route.ts          # Operaciones específicas
├── permisos/
│   ├── route.ts              # CRUD de permisos
│   └── [id]/
│       └── route.ts          # Operaciones específicas
├── security/
│   └── accesos/
│       ├── route.ts          # Registro de accesos
│       └── estadisticas/
│           └── route.ts      # Estadísticas de accesos
├── configuracion/
│   └── route.ts              # Configuración del sistema
└── sucursales/
    └── route.ts              # CRUD de sucursales

components/
└── modals/
    ├── user-modal.tsx            # Modal de usuario
    ├── role-modal.tsx            # Modal de rol
    └── configuracion-modal.tsx   # Modal de configuración
```

## APIs Principales

### Usuarios

#### GET `/api/usuarios`
Obtiene la lista de usuarios con filtros y paginación.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  rol_id?: number;
  sucursal_id?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Respuesta:**
```typescript
{
  usuarios: Array<{
    usuario_id: number;
    username: string;
    email: string;
    nombre: string;
    apellido: string;
    rol_nombre: string;
    sucursal_nombre: string;
    estado: string;
    ultimo_acceso?: string;
    fecha_creacion: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

#### POST `/api/usuarios`
Crea un nuevo usuario.

**Body:**
```typescript
{
  username: string;
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol_id: number;
  sucursal_id?: number;
  estado: string;
}
```

#### PUT `/api/usuarios/[id]`
Actualiza un usuario existente.

**Body:**
```typescript
{
  username?: string;
  email?: string;
  password?: string;
  nombre?: string;
  apellido?: string;
  rol_id?: number;
  sucursal_id?: number;
  estado?: string;
}
```

### Roles

#### GET `/api/roles`
Obtiene la lista de roles con filtros y paginación.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Respuesta:**
```typescript
{
  roles: Array<{
    rol_id: number;
    nombre: string;
    descripcion?: string;
    estado: string;
    total_usuarios: number;
    total_permisos: number;
    fecha_creacion: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

#### POST `/api/roles`
Crea un nuevo rol.

**Body:**
```typescript
{
  nombre: string;
  descripcion?: string;
  estado: string;
  permisos: Array<number>;
}
```

### Permisos

#### GET `/api/permisos`
Obtiene la lista de permisos con filtros y paginación.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  modulo?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Respuesta:**
```typescript
{
  permisos: Array<{
    permiso_id: number;
    nombre: string;
    descripcion?: string;
    modulo: string;
    accion: string;
    estado: string;
    total_roles: number;
    fecha_creacion: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

### Auditoría

#### GET `/api/security/accesos`
Obtiene el registro de accesos al sistema.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  usuario_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  tipo_acceso?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Respuesta:**
```typescript
{
  accesos: Array<{
    acceso_id: number;
    usuario_id: number;
    usuario_nombre: string;
    fecha_acceso: string;
    tipo_acceso: string;
    ip_address: string;
    user_agent: string;
    exito: boolean;
    observaciones?: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

#### GET `/api/security/accesos/estadisticas`
Obtiene estadísticas de accesos al sistema.

**Respuesta:**
```typescript
{
  resumen: {
    total_accesos: number;
    accesos_exitosos: number;
    accesos_fallidos: number;
    usuarios_activos: number;
    usuarios_inactivos: number;
  };
  por_dia: Array<{
    fecha: string;
    total_accesos: number;
    accesos_exitosos: number;
    accesos_fallidos: number;
  }>;
  por_usuario: Array<{
    usuario_id: number;
    usuario_nombre: string;
    total_accesos: number;
    ultimo_acceso: string;
  }>;
  por_hora: Array<{
    hora: number;
    total_accesos: number;
  }>;
}
```

### Configuración

#### GET `/api/configuracion`
Obtiene la configuración del sistema.

**Respuesta:**
```typescript
{
  configuracion: {
    sistema: {
      nombre: string;
      version: string;
      descripcion: string;
      logo?: string;
      favicon?: string;
    };
    seguridad: {
      session_timeout: number;
      max_login_attempts: number;
      password_min_length: number;
      password_require_special: boolean;
      two_factor_auth: boolean;
    };
    notificaciones: {
      email_enabled: boolean;
      sms_enabled: boolean;
      push_enabled: boolean;
      email_smtp_host: string;
      email_smtp_port: number;
      email_smtp_user: string;
    };
    reportes: {
      default_format: string;
      max_records: number;
      cache_ttl: number;
    };
    backup: {
      enabled: boolean;
      frequency: string;
      retention_days: number;
      storage_path: string;
    };
  };
}
```

#### PUT `/api/configuracion`
Actualiza la configuración del sistema.

**Body:**
```typescript
{
  sistema?: {
    nombre?: string;
    descripcion?: string;
    logo?: string;
    favicon?: string;
  };
  seguridad?: {
    session_timeout?: number;
    max_login_attempts?: number;
    password_min_length?: number;
    password_require_special?: boolean;
    two_factor_auth?: boolean;
  };
  notificaciones?: {
    email_enabled?: boolean;
    sms_enabled?: boolean;
    push_enabled?: boolean;
    email_smtp_host?: string;
    email_smtp_port?: number;
    email_smtp_user?: string;
  };
  reportes?: {
    default_format?: string;
    max_records?: number;
    cache_ttl?: number;
  };
  backup?: {
    enabled?: boolean;
    frequency?: string;
    retention_days?: number;
    storage_path?: string;
  };
}
```

## Componentes Principales

### UsuariosPage
Página principal para la gestión de usuarios.

**Funcionalidades:**
- Lista paginada de usuarios
- Filtros avanzados por rol y estado
- Búsqueda en tiempo real
- Acciones de crear, editar, eliminar
- Asignación de roles
- Control de estados

### RolesPermisosPage
Página principal para la gestión de roles y permisos.

**Funcionalidades:**
- Lista paginada de roles
- Filtros por estado
- Búsqueda por nombre
- Acciones de crear, editar, eliminar
- Asignación de permisos
- Jerarquía de roles

### AuditoriaPage
Página principal para la auditoría del sistema.

**Funcionalidades:**
- Lista paginada de accesos
- Filtros por usuario y fecha
- Búsqueda por tipo de acceso
- Estadísticas de uso
- Exportación de logs
- Análisis de actividad

### ConfiguracionPage
Página principal para la configuración del sistema.

**Funcionalidades:**
- Configuración general
- Parámetros de seguridad
- Configuración de notificaciones
- Parámetros de reportes
- Configuración de backup
- Validación de configuración

## Hooks Personalizados

### useUsuarios
Hook específico para gestión de usuarios.

```typescript
const {
  usuarios,
  loading,
  error,
  pagination,
  fetchUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario
} = useUsuarios(options);
```

### useRoles
Hook específico para gestión de roles.

```typescript
const {
  roles,
  loading,
  error,
  pagination,
  fetchRoles,
  createRol,
  updateRol,
  deleteRol
} = useRoles(options);
```

### usePermisos
Hook específico para gestión de permisos.

```typescript
const {
  permisos,
  loading,
  error,
  pagination,
  fetchPermisos,
  createPermiso,
  updatePermiso,
  deletePermiso
} = usePermisos(options);
```

### useAuditoria
Hook específico para auditoría del sistema.

```typescript
const {
  accesos,
  loading,
  error,
  pagination,
  fetchAccesos,
  fetchEstadisticas
} = useAuditoria(options);
```

### useConfiguracion
Hook específico para configuración del sistema.

```typescript
const {
  configuracion,
  loading,
  error,
  fetchConfiguracion,
  updateConfiguracion
} = useConfiguracion();
```

## Tipos TypeScript

### Usuario
```typescript
interface Usuario {
  usuario_id: number;
  username: string;
  email: string;
  password?: string;
  nombre: string;
  apellido: string;
  rol_id: number;
  rol_nombre: string;
  sucursal_id?: number;
  sucursal_nombre?: string;
  estado: 'activo' | 'inactivo' | 'suspendido' | 'bloqueado';
  ultimo_acceso?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}
```

### Rol
```typescript
interface Rol {
  rol_id: number;
  nombre: string;
  descripcion?: string;
  estado: 'activo' | 'inactivo';
  total_usuarios: number;
  total_permisos: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
  permisos: Array<{
    permiso_id: number;
    nombre: string;
    modulo: string;
    accion: string;
  }>;
}
```

### Permiso
```typescript
interface Permiso {
  permiso_id: number;
  nombre: string;
  descripcion?: string;
  modulo: string;
  accion: string;
  estado: 'activo' | 'inactivo';
  total_roles: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}
```

### Acceso
```typescript
interface Acceso {
  acceso_id: number;
  usuario_id: number;
  usuario_nombre: string;
  fecha_acceso: string;
  tipo_acceso: 'login' | 'logout' | 'session_expired' | 'failed_login';
  ip_address: string;
  user_agent: string;
  exito: boolean;
  observaciones?: string;
}
```

### Configuracion
```typescript
interface Configuracion {
  sistema: {
    nombre: string;
    version: string;
    descripcion: string;
    logo?: string;
    favicon?: string;
  };
  seguridad: {
    session_timeout: number;
    max_login_attempts: number;
    password_min_length: number;
    password_require_special: boolean;
    two_factor_auth: boolean;
  };
  notificaciones: {
    email_enabled: boolean;
    sms_enabled: boolean;
    push_enabled: boolean;
    email_smtp_host: string;
    email_smtp_port: number;
    email_smtp_user: string;
  };
  reportes: {
    default_format: string;
    max_records: number;
    cache_ttl: number;
  };
  backup: {
    enabled: boolean;
    frequency: string;
    retention_days: number;
    storage_path: string;
  };
}
```

## Permisos Requeridos

### Usuarios
- `administracion.usuarios.ver` - Ver lista de usuarios
- `administracion.usuarios.crear` - Crear nuevos usuarios
- `administracion.usuarios.editar` - Editar usuarios existentes
- `administracion.usuarios.eliminar` - Eliminar usuarios

### Roles
- `administracion.roles.ver` - Ver lista de roles
- `administracion.roles.crear` - Crear nuevos roles
- `administracion.roles.editar` - Editar roles existentes
- `administracion.roles.eliminar` - Eliminar roles

### Permisos
- `administracion.permisos.ver` - Ver lista de permisos
- `administracion.permisos.crear` - Crear nuevos permisos
- `administracion.permisos.editar` - Editar permisos existentes
- `administracion.permisos.eliminar` - Eliminar permisos

### Auditoría
- `administracion.auditoria.ver` - Ver auditoría del sistema
- `administracion.auditoria.exportar` - Exportar logs de auditoría

### Configuración
- `administracion.configuracion.ver` - Ver configuración del sistema
- `administracion.configuracion.editar` - Editar configuración del sistema

## Configuración

### Variables de Entorno
```env
ADMIN_PAGINATION_LIMIT=20
ADMIN_CACHE_TTL=300000
ADMIN_AUDIT_LOG_ENABLED=true
ADMIN_SESSION_TIMEOUT=3600
ADMIN_MAX_LOGIN_ATTEMPTS=5
ADMIN_PASSWORD_MIN_LENGTH=8
```

### Configuración de Seguridad
```typescript
const SECURITY_CONFIG = {
  sessionTimeout: 3600, // 1 hora
  maxLoginAttempts: 5,
  passwordMinLength: 8,
  passwordRequireSpecial: true,
  twoFactorAuth: false,
  auditLogEnabled: true
};
```

### Configuración de Auditoría
```typescript
const AUDIT_CONFIG = {
  logLevels: ['info', 'warn', 'error'],
  logRetentionDays: 90,
  logRotationSize: '100MB',
  logCompression: true,
  logEncryption: false
};
```

## Optimizaciones

### Performance
- **Lazy Loading**: Carga diferida de componentes
- **Virtual Scrolling**: Para listas largas
- **Memoization**: Optimización de re-renders
- **Debounced Search**: Búsqueda optimizada

### Caching
- **Client-side**: Cache de datos en memoria
- **Server-side**: Cache de consultas
- **CDN**: Cache de assets estáticos

### Database
- **Indexes**: Índices optimizados
- **Query Optimization**: Consultas optimizadas
- **Connection Pooling**: Pool de conexiones
- **Read Replicas**: Réplicas de lectura

## Testing

### Unit Tests
```typescript
describe('AdministracionPage', () => {
  it('should render usuarios list', () => {
    // Test implementation
  });
  
  it('should handle create usuario', () => {
    // Test implementation
  });
  
  it('should handle edit usuario', () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
describe('Administracion API', () => {
  it('should create usuario', async () => {
    // Test implementation
  });
  
  it('should update rol', async () => {
    // Test implementation
  });
  
  it('should delete permiso', async () => {
    // Test implementation
  });
});
```

## Troubleshooting

### Problemas Comunes

1. **Usuarios no se crean**
   - Verificar permisos del usuario
   - Revisar validaciones de datos
   - Verificar conexión a base de datos

2. **Roles no se asignan**
   - Verificar permisos de administración
   - Revisar validaciones de rol
   - Verificar estado del rol

3. **Auditoría no registra**
   - Verificar configuración de auditoría
   - Revisar permisos de escritura
   - Verificar estado del servicio

### Logs de Debug
```typescript
console.log('Usuario creado:', usuario);
console.log('Rol actualizado:', rol);
console.log('Acceso registrado:', acceso);
```

## Roadmap

### Próximas Funcionalidades
- [ ] Autenticación de dos factores
- [ ] Integración con LDAP/Active Directory
- [ ] Notificaciones automáticas
- [ ] Backup automático
- [ ] Análisis de seguridad
- [ ] Mobile app

### Mejoras Técnicas
- [ ] WebSockets para actualizaciones
- [ ] Advanced caching
- [ ] Performance monitoring
- [ ] Error tracking
- [ ] Analytics dashboard
