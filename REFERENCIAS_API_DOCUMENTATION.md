# API de Referencias - Documentación

Esta documentación describe las APIs para la gestión de módulos de Referencias del sistema de taller.

## Módulos Incluidos

- **Proveedores** - Gestión de proveedores
- **Productos** - Gestión de productos e inventario
- **Categorías** - Gestión de categorías de productos
- **Clientes** - Gestión de clientes
- **Marcas** - Gestión de marcas de productos
- **Tipos de Servicio** - Gestión de tipos de servicios

## Estructura de URLs

Todas las APIs siguen el patrón: `/api/referencias/{modulo}`

## Autenticación

Todas las APIs requieren autenticación mediante token JWT en el header:
```
Authorization: Bearer <token>
```

## Permisos Requeridos

Cada módulo requiere permisos específicos:
- `crear_{modulo}` - Crear registros
- `leer_{modulo}` - Leer registros
- `actualizar_{modulo}` - Actualizar registros
- `eliminar_{modulo}` - Eliminar registros

---

## 📦 PROVEEDORES

### GET /api/referencias/proveedores
Listar proveedores con paginación y filtros.

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `search` (opcional): Búsqueda por nombre, email, teléfono o RUC
- `sort_by` (opcional): Campo para ordenar (default: nombre_proveedor)
- `sort_order` (opcional): Orden (asc/desc, default: asc)

**Response:**
```json
{
  "success": true,
  "message": "Proveedores obtenidos exitosamente",
  "data": [
    {
      "proveedor_id": 1,
      "nombre_proveedor": "Proveedor ABC",
      "correo": "contacto@proveedor.com",
      "telefono": "+595 21 123456",
      "ruc": "12345678-9",
      "direccion": "Av. Principal 123",
      "ciudad_id": 1,
      "ciudad_nombre": "Asunción",
      "usuario_nombre": "Admin"
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

### POST /api/referencias/proveedores
Crear un nuevo proveedor.

**Request Body:**
```json
{
  "nombre_proveedor": "Proveedor XYZ",
  "correo": "info@proveedor.com",
  "telefono": "+595 21 987654",
  "ruc": "87654321-0",
  "direccion": "Calle Secundaria 456",
  "ciudad_id": 2
}
```

### GET /api/referencias/proveedores/[id]
Obtener un proveedor específico por ID.

### PUT /api/referencias/proveedores/[id]
Actualizar un proveedor existente.

### DELETE /api/referencias/proveedores/[id]
Eliminar un proveedor (verifica que no tenga compras asociadas).

---

## 🛍️ PRODUCTOS

### GET /api/referencias/productos
Listar productos con información completa.

**Query Parameters:**
- `page`, `limit`, `search`, `sort_by`, `sort_order` (igual que proveedores)
- `estado` (opcional): Filtrar por estado activo (true/false)
- `categoria_id` (opcional): Filtrar por categoría
- `marca_id` (opcional): Filtrar por marca

**Response:**
```json
{
  "success": true,
  "message": "Productos obtenidos exitosamente",
  "data": [
    {
      "producto_id": 1,
      "nombre_producto": "Gas R410",
      "descripcion_producto": "Gas para aire acondicionado",
      "precio_unitario": 85000,
      "stock": 16,
      "categoria_id": 3,
      "categoria_nombre": "gas",
      "marca_id": 1,
      "marca_nombre": "Marca ABC",
      "unidad_id": 1,
      "unidad_nombre": "Unidad",
      "impuesto_id": 2,
      "impuesto_nombre": "IVA 10%",
      "impuesto_porcentaje": 10,
      "precio_costo": 75000,
      "precio_venta": 85000,
      "stock_minimo": 5,
      "stock_maximo": 50,
      "cod_product": 1001,
      "estado": true
    }
  ]
}
```

### POST /api/referencias/productos
Crear un nuevo producto.

**Request Body:**
```json
{
  "nombre_producto": "Nuevo Producto",
  "descripcion_producto": "Descripción del producto",
  "precio_unitario": 100000,
  "stock": 10,
  "categoria_id": 1,
  "marca_id": 1,
  "unidad_id": 1,
  "impuesto_id": 1,
  "precio_costo": 80000,
  "precio_venta": 100000,
  "stock_minimo": 5,
  "stock_maximo": 100,
  "cod_product": 2001,
  "estado": true
}
```

### GET /api/referencias/productos/[id]
Obtener un producto específico por ID.

### PUT /api/referencias/productos/[id]
Actualizar un producto existente.

### DELETE /api/referencias/productos/[id]
Eliminar un producto (verifica que no tenga ventas/compras asociadas).

---

## 📂 CATEGORÍAS

### GET /api/referencias/categorias
Listar categorías con conteo de productos.

**Query Parameters:**
- `page`, `limit`, `search`, `sort_by`, `sort_order` (igual que proveedores)
- `estado` (opcional): Filtrar por estado activo (true/false)

**Response:**
```json
{
  "success": true,
  "message": "Categorías obtenidas exitosamente",
  "data": [
    {
      "categoria_id": 1,
      "nombre_categoria": "compresor",
      "estado": true,
      "productos_count": 5
    }
  ]
}
```

### POST /api/referencias/categorias
Crear una nueva categoría.

**Request Body:**
```json
{
  "nombre_categoria": "Nueva Categoría",
  "estado": true
}
```

### GET /api/referencias/categorias/[id]
Obtener una categoría específica por ID.

### PUT /api/referencias/categorias/[id]
Actualizar una categoría existente.

### DELETE /api/referencias/categorias/[id]
Eliminar una categoría (verifica que no tenga productos asociados).

---

## 👥 CLIENTES

### GET /api/referencias/clientes
Listar clientes con información completa.

**Query Parameters:**
- `page`, `limit`, `search`, `sort_by`, `sort_order` (igual que proveedores)
- `estado` (opcional): Filtrar por estado (activo/inactivo/suspendido)

**Response:**
```json
{
  "success": true,
  "message": "Clientes obtenidos exitosamente",
  "data": [
    {
      "cliente_id": 1,
      "nombre": "Cliente ABC",
      "direccion": "Av. Principal 123",
      "ruc": "12345678-9",
      "telefono": "+595 21 123456",
      "email": "cliente@email.com",
      "estado": "activo",
      "ciudad_id": 1,
      "ciudad_nombre": "Asunción",
      "lista_id": 1,
      "lista_nombre": "Lista General"
    }
  ]
}
```

### POST /api/referencias/clientes
Crear un nuevo cliente.

**Request Body:**
```json
{
  "nombre": "Nuevo Cliente",
  "direccion": "Calle Nueva 456",
  "ruc": "87654321-0",
  "telefono": "+595 21 987654",
  "email": "nuevo@cliente.com",
  "estado": "activo",
  "ciudad_id": 2,
  "lista_id": 1
}
```

### GET /api/referencias/clientes/[id]
Obtener un cliente específico por ID.

### PUT /api/referencias/clientes/[id]
Actualizar un cliente existente.

### DELETE /api/referencias/clientes/[id]
Eliminar un cliente (verifica que no tenga ventas asociadas).

---

## 🏷️ MARCAS

### GET /api/referencias/marcas
Listar marcas con conteo de productos.

**Query Parameters:**
- `page`, `limit`, `search`, `sort_by`, `sort_order` (igual que proveedores)

**Response:**
```json
{
  "success": true,
  "message": "Marcas obtenidas exitosamente",
  "data": [
    {
      "marca_id": 1,
      "descripcion": "Marca ABC",
      "productos_count": 10
    }
  ]
}
```

### POST /api/referencias/marcas
Crear una nueva marca.

**Request Body:**
```json
{
  "descripcion": "Nueva Marca"
}
```

### GET /api/referencias/marcas/[id]
Obtener una marca específica por ID.

### PUT /api/referencias/marcas/[id]
Actualizar una marca existente.

### DELETE /api/referencias/marcas/[id]
Eliminar una marca (verifica que no tenga productos asociados).

---

## 🔧 TIPOS DE SERVICIO

### GET /api/referencias/tipos-servicio
Listar tipos de servicio con conteo de servicios.

**Query Parameters:**
- `page`, `limit`, `search`, `sort_by`, `sort_order` (igual que proveedores)
- `activo` (opcional): Filtrar por estado activo (true/false)

**Response:**
```json
{
  "success": true,
  "message": "Tipos de servicio obtenidos exitosamente",
  "data": [
    {
      "tipo_serv_id": 1,
      "descripcion": "Mantenimiento de Aires Acondicionados",
      "nombre": "Mantenimiento",
      "activo": true,
      "servicios_count": 5
    }
  ]
}
```

### POST /api/referencias/tipos-servicio
Crear un nuevo tipo de servicio.

**Request Body:**
```json
{
  "descripcion": "Reparación de Equipos",
  "nombre": "Reparación",
  "activo": true
}
```

### GET /api/referencias/tipos-servicio/[id]
Obtener un tipo de servicio específico por ID.

### PUT /api/referencias/tipos-servicio/[id]
Actualizar un tipo de servicio existente.

### DELETE /api/referencias/tipos-servicio/[id]
Eliminar un tipo de servicio (verifica que no tenga servicios asociados).

---

## Validaciones

### Proveedores
- **nombre_proveedor**: Requerido, mínimo 2 caracteres
- **correo**: Formato de email válido (opcional)
- **telefono**: Formato de teléfono paraguayo (opcional)
- **ruc**: Formato RUC paraguayo (opcional, único)

### Productos
- **nombre_producto**: Requerido, mínimo 2 caracteres
- **precio_unitario**: Número no negativo (opcional)
- **stock**: Número no negativo (opcional)
- **precio_costo**: Número no negativo (opcional)
- **precio_venta**: Número no negativo (opcional)
- **stock_minimo**: Número no negativo (opcional)
- **stock_maximo**: Número no negativo (opcional)
- **cod_product**: Número positivo único (opcional)
- **categoria_id**: Debe existir y estar activa (opcional)
- **marca_id**: Debe existir (opcional)
- **unidad_id**: Debe existir (opcional)
- **impuesto_id**: Debe existir y estar activo (opcional)

### Categorías
- **nombre_categoria**: Requerido, mínimo 2 caracteres, único

### Clientes
- **nombre**: Requerido, mínimo 2 caracteres
- **email**: Formato de email válido (opcional)
- **telefono**: Formato de teléfono paraguayo (opcional)
- **ruc**: Formato RUC paraguayo (opcional, único)
- **estado**: Debe ser 'activo', 'inactivo' o 'suspendido' (opcional)
- **ciudad_id**: Debe existir (opcional)
- **lista_id**: Debe existir y estar activa (opcional)

### Marcas
- **descripcion**: Requerido, mínimo 2 caracteres, único

### Tipos de Servicio
- **nombre**: Requerido, mínimo 2 caracteres, único
- **descripcion**: Requerido, mínimo 2 caracteres

## Códigos de Error

- `400` - Bad Request: Datos de entrada inválidos
- `401` - Unauthorized: Token de acceso requerido o inválido
- `403` - Forbidden: No tiene permisos para realizar la acción
- `404` - Not Found: Recurso no encontrado
- `409` - Conflict: Conflicto con datos existentes (duplicados, en uso)
- `500` - Internal Server Error: Error interno del servidor

## Características Especiales

### Paginación
Todas las APIs de listado soportan paginación con:
- Página actual
- Límite de elementos por página (máximo 100)
- Total de elementos
- Total de páginas

### Búsqueda
Soporte para búsqueda en múltiples campos relevantes para cada módulo.

### Ordenamiento
Ordenamiento por cualquier campo relevante en orden ascendente o descendente.

### Validación de Dependencias
Antes de eliminar registros, se verifica que no tengan dependencias:
- Categorías: No pueden eliminarse si tienen productos
- Marcas: No pueden eliminarse si tienen productos
- Tipos de Servicio: No pueden eliminarse si tienen servicios
- Proveedores: No pueden eliminarse si tienen compras
- Clientes: No pueden eliminarse si tienen ventas
- Productos: No pueden eliminarse si tienen ventas o compras

### Logs de Auditoría
Todas las operaciones de creación, actualización y eliminación se registran en logs para auditoría.

### Formateo de Datos
- Teléfonos paraguayos se formatean automáticamente
- RUCs paraguayos se validan y formatean
- Monedas se formatean según estándares paraguayos
