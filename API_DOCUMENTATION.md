# API de Autenticación y Gestión de Usuarios

Esta documentación describe las APIs para autenticación y gestión de usuarios del sistema de taller.

## Configuración

### Variables de Entorno

Crear un archivo `.env.local` con las siguientes variables:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taller_gestion
DB_USER=postgres
DB_PASSWORD=tu_password_aqui

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_REFRESH_SECRET=tu_jwt_refresh_secret_muy_seguro_aqui
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Configuración de la aplicación
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Dependencias

Instalar las dependencias necesarias:

```bash
npm install pg @types/pg bcryptjs @types/bcryptjs jsonwebtoken @types/jsonwebtoken
```

## Autenticación

### POST /api/auth/login

Iniciar sesión en el sistema.

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123",
  "remember_me": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "usuario": {
      "usuario_id": 1,
      "nombre": "Administrador",
      "email": "admin@taller.com",
      "username": "admin",
      "rol_id": 6,
      "rol_nombre": "Super Administrador",
      "activo": true,
      "is_2fa_enabled": false,
      "sucursales": []
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "permisos": ["crear_usuarios", "leer_usuarios", ...]
  }
}
```

### POST /api/auth/logout

Cerrar sesión en el sistema.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

### POST /api/auth/refresh

Renovar token de acceso.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token renovado exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

### GET /api/auth/me

Obtener información del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Información del usuario obtenida exitosamente",
  "data": {
    "usuario_id": 1,
    "nombre": "Administrador",
    "email": "admin@taller.com",
    "username": "admin",
    "rol_id": 6,
    "rol_nombre": "Super Administrador",
    "activo": true,
    "is_2fa_enabled": false,
    "permisos": ["crear_usuarios", "leer_usuarios", ...],
    "sucursales": []
  }
}
```

## Gestión de Usuarios

### GET /api/usuarios

Listar usuarios del sistema.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `search` (opcional): Búsqueda por nombre, email o username
- `sort_by` (opcional): Campo para ordenar (default: created_at)
- `sort_order` (opcional): Orden (asc/desc, default: desc)
- `activo` (opcional): Filtrar por estado activo (true/false)

**Response:**
```json
{
  "success": true,
  "message": "Usuarios obtenidos exitosamente",
  "data": [
    {
      "usuario_id": 1,
      "nombre": "Administrador",
      "email": "admin@taller.com",
      "username": "admin",
      "activo": true,
      "created_at": "2025-09-05T20:00:02.815805Z",
      "updated_at": "2025-09-05T22:23:21.594794Z",
      "rol_nombre": "Super Administrador",
      "sucursales": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "total_pages": 1
  }
}
```

### POST /api/usuarios

Crear un nuevo usuario.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@taller.com",
  "username": "juan",
  "password": "Password123!",
  "rol_id": 6,
  "id_empleado": 1,
  "sucursales": [1, 2]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "usuario_id": 2,
    "nombre": "Juan Pérez",
    "email": "juan@taller.com",
    "username": "juan",
    "activo": true,
    "created_at": "2025-09-06T10:00:00.000Z",
    "rol_nombre": "Super Administrador",
    "sucursales": [
      {"sucursal_id": 1, "nombre": "Sucursal Central"},
      {"sucursal_id": 2, "nombre": "Sucursal Norte"}
    ]
  }
}
```

### GET /api/usuarios/[id]

Obtener un usuario específico por ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario obtenido exitosamente",
  "data": {
    "usuario_id": 1,
    "nombre": "Administrador",
    "email": "admin@taller.com",
    "username": "admin",
    "activo": true,
    "rol_id": 6,
    "rol_nombre": "Super Administrador",
    "permisos": ["crear_usuarios", "leer_usuarios", ...],
    "sucursales": []
  }
}
```

### PUT /api/usuarios/[id]

Actualizar un usuario existente.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "nombre": "Juan Carlos Pérez",
  "email": "juan.carlos@taller.com",
  "activo": true,
  "sucursales": [1, 3]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario actualizado exitosamente",
  "data": {
    "usuario_id": 2,
    "nombre": "Juan Carlos Pérez",
    "email": "juan.carlos@taller.com",
    "username": "juan",
    "activo": true,
    "updated_at": "2025-09-06T11:00:00.000Z",
    "sucursales": [
      {"sucursal_id": 1, "nombre": "Sucursal Central"},
      {"sucursal_id": 3, "nombre": "Sucursal Sur"}
    ]
  }
}
```

### DELETE /api/usuarios/[id]

Eliminar un usuario (soft delete).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

## Gestión de Roles

### GET /api/roles

Listar roles del sistema.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `search` (opcional): Búsqueda por nombre o descripción
- `sort_by` (opcional): Campo para ordenar (default: created_at)
- `sort_order` (opcional): Orden (asc/desc, default: desc)
- `activo` (opcional): Filtrar por estado activo (true/false)

**Response:**
```json
{
  "success": true,
  "message": "Roles obtenidos exitosamente",
  "data": [
    {
      "rol_id": 6,
      "nombre": "Super Administrador",
      "descripcion": "Acceso completo al sistema",
      "activo": true,
      "created_at": "2025-09-05T19:59:29.987506Z",
      "permisos": [
        {"permiso_id": 70, "nombre": "crear_usuarios", "descripcion": null},
        {"permiso_id": 71, "nombre": "leer_usuarios", "descripcion": null}
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "total_pages": 1
  }
}
```

### POST /api/roles

Crear un nuevo rol.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "nombre": "Técnico",
  "descripcion": "Rol para técnicos del taller",
  "permisos": [78, 79, 80, 81]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rol creado exitosamente",
  "data": {
    "rol_id": 7,
    "nombre": "Técnico",
    "descripcion": "Rol para técnicos del taller",
    "activo": true,
    "created_at": "2025-09-06T10:00:00.000Z",
    "permisos": [
      {"permiso_id": 78, "nombre": "crear_servicios", "descripcion": null},
      {"permiso_id": 79, "nombre": "leer_servicios", "descripcion": null}
    ]
  }
}
```

### GET /api/roles/[id]

Obtener un rol específico por ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Rol obtenido exitosamente",
  "data": {
    "rol_id": 6,
    "nombre": "Super Administrador",
    "descripcion": "Acceso completo al sistema",
    "activo": true,
    "permisos": [
      {"permiso_id": 70, "nombre": "crear_usuarios", "descripcion": null}
    ],
    "usuarios": [
      {"usuario_id": 1, "nombre": "Administrador", "email": "admin@taller.com"}
    ]
  }
}
```

### PUT /api/roles/[id]

Actualizar un rol existente.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "nombre": "Técnico Senior",
  "descripcion": "Rol para técnicos senior del taller",
  "permisos": [78, 79, 80, 81, 82, 83]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Rol actualizado exitosamente",
  "data": {
    "rol_id": 7,
    "nombre": "Técnico Senior",
    "descripcion": "Rol para técnicos senior del taller",
    "activo": true,
    "permisos": [
      {"permiso_id": 78, "nombre": "crear_servicios", "descripcion": null}
    ]
  }
}
```

### DELETE /api/roles/[id]

Eliminar un rol.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Rol eliminado exitosamente"
}
```

## Gestión de Permisos

### GET /api/permisos

Listar permisos del sistema.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `search` (opcional): Búsqueda por nombre o descripción
- `sort_by` (opcional): Campo para ordenar (default: nombre)
- `sort_order` (opcional): Orden (asc/desc, default: asc)
- `activo` (opcional): Filtrar por estado activo (true/false)

**Response:**
```json
{
  "success": true,
  "message": "Permisos obtenidos exitosamente",
  "data": [
    {
      "permiso_id": 70,
      "nombre": "crear_usuarios",
      "descripcion": null,
      "activo": true,
      "created_at": "2025-08-29T23:17:02.508477Z",
      "roles": [
        {"rol_id": 6, "nombre": "Super Administrador", "descripcion": null}
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 24,
    "total_pages": 3
  }
}
```

### POST /api/permisos

Crear un nuevo permiso.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "nombre": "gestionar_inventario",
  "descripcion": "Permiso para gestionar el inventario del taller"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Permiso creado exitosamente",
  "data": {
    "permiso_id": 94,
    "nombre": "gestionar_inventario",
    "descripcion": "Permiso para gestionar el inventario del taller",
    "activo": true,
    "created_at": "2025-09-06T10:00:00.000Z"
  }
}
```

### GET /api/permisos/[id]

Obtener un permiso específico por ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Permiso obtenido exitosamente",
  "data": {
    "permiso_id": 70,
    "nombre": "crear_usuarios",
    "descripcion": null,
    "activo": true,
    "roles": [
      {"rol_id": 6, "nombre": "Super Administrador", "descripcion": null}
    ]
  }
}
```

### PUT /api/permisos/[id]

Actualizar un permiso existente.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "nombre": "gestionar_usuarios",
  "descripcion": "Permiso para gestionar usuarios del sistema"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Permiso actualizado exitosamente",
  "data": {
    "permiso_id": 70,
    "nombre": "gestionar_usuarios",
    "descripcion": "Permiso para gestionar usuarios del sistema",
    "activo": true
  }
}
```

### DELETE /api/permisos/[id]

Eliminar un permiso.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Permiso eliminado exitosamente"
}
```

## Códigos de Error

- `400` - Bad Request: Datos de entrada inválidos
- `401` - Unauthorized: Token de acceso requerido o inválido
- `403` - Forbidden: No tiene permisos para realizar la acción
- `404` - Not Found: Recurso no encontrado
- `409` - Conflict: Conflicto con datos existentes
- `423` - Locked: Usuario bloqueado por intentos fallidos
- `500` - Internal Server Error: Error interno del servidor

## Seguridad

- Las contraseñas se encriptan usando bcrypt con 12 rounds
- Los tokens JWT tienen tiempo de expiración configurable
- Se implementa bloqueo de usuarios por intentos fallidos
- Se registran logs de auditoría para todas las operaciones
- Se valida la fortaleza de las contraseñas
- Se sanitizan los datos sensibles en los logs

## Validaciones

### Usuario
- Nombre: mínimo 2 caracteres
- Email: formato válido y único
- Username: 3-50 caracteres alfanuméricos, único
- Contraseña: mínimo 8 caracteres, debe incluir mayúsculas, minúsculas, números y caracteres especiales

### Rol
- Nombre: mínimo 2 caracteres, único
- Debe tener al menos un permiso asignado

### Permiso
- Nombre: mínimo 2 caracteres, único
