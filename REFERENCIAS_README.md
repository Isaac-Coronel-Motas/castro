# Módulo de Referencias - Sistema de Taller JC

## Descripción
El módulo de Referencias permite gestionar todos los datos maestros del sistema, incluyendo proveedores, productos, clientes, marcas, categorías y tipos de servicio.

## Estructura del Módulo

### 1. Proveedores (`/referencias/proveedores`)
- **Funcionalidad**: Gestión completa de proveedores
- **Características**:
  - Lista paginada con búsqueda y ordenamiento
  - Crear, editar, ver y eliminar proveedores
  - Validación de formularios
  - Confirmación de eliminación
- **Campos principales**:
  - Nombre del proveedor
  - Contacto (nombre y teléfono)
  - Email y dirección
  - Estado activo/inactivo

### 2. Productos (`/referencias/productos`)
- **Funcionalidad**: Gestión de productos disponibles
- **Características**:
  - Lista paginada con búsqueda y ordenamiento
  - Crear, editar, ver y eliminar productos
  - Validación de formularios
  - Confirmación de eliminación
- **Campos principales**:
  - Nombre del producto
  - Descripción
  - Precio de compra y venta
  - Stock mínimo y máximo
  - Categoría y marca asociadas

### 3. Clientes (`/referencias/clientes`)
- **Funcionalidad**: Gestión de clientes del taller
- **Características**:
  - Lista paginada con búsqueda y ordenamiento
  - Crear, editar, ver y eliminar clientes
  - Validación de formularios
  - Confirmación de eliminación
- **Campos principales**:
  - Nombre completo
  - Teléfono y email
  - Dirección
  - Tipo de cliente (individual/empresa)
  - Estado activo/inactivo

### 4. Marcas (`/referencias/marcas`)
- **Funcionalidad**: Gestión de marcas de productos
- **Características**:
  - Lista paginada con búsqueda y ordenamiento
  - Crear, editar, ver y eliminar marcas
  - Validación de formularios
  - Confirmación de eliminación
- **Campos principales**:
  - Nombre de la marca
  - Descripción
  - Estado activo/inactivo

### 5. Categorías (`/referencias/categorias`)
- **Funcionalidad**: Gestión de categorías de productos
- **Características**:
  - Lista paginada con búsqueda y ordenamiento
  - Crear, editar, ver y eliminar categorías
  - Validación de formularios
  - Confirmación de eliminación
- **Campos principales**:
  - Nombre de la categoría
  - Descripción
  - Estado activo/inactivo

### 6. Tipos de Servicio (`/referencias/tipos-servicio`)
- **Funcionalidad**: Gestión de servicios técnicos
- **Características**:
  - Lista paginada con búsqueda y ordenamiento
  - Crear, editar, ver y eliminar servicios
  - Validación de formularios
  - Confirmación de eliminación
- **Campos principales**:
  - Nombre del servicio
  - Descripción
  - Precio base
  - Tipo de servicio (reparación, instalación, mantenimiento, etc.)

## Componentes Utilizados

### Componentes Principales
- **AppLayout**: Layout principal con sidebar y header
- **DataTable**: Tabla genérica con paginación, búsqueda y ordenamiento
- **ConfirmDeleteModal**: Modal de confirmación para eliminaciones

### Modales Específicos
- **ProveedorModal**: Modal para gestión de proveedores
- **ProductoModal**: Modal para gestión de productos
- **ClienteModal**: Modal para gestión de clientes
- **MarcaModal**: Modal para gestión de marcas
- **ServicioModal**: Modal para gestión de servicios

### Hooks Personalizados
- **useApi**: Hook genérico para operaciones CRUD con la API
- **useAuth**: Hook para gestión de autenticación

## APIs Requeridas

### Endpoints Necesarios
```
GET    /api/referencias/proveedores     - Listar proveedores
POST   /api/referencias/proveedores     - Crear proveedor
PUT    /api/referencias/proveedores/:id - Actualizar proveedor
DELETE /api/referencias/proveedores/:id - Eliminar proveedor

GET    /api/referencias/productos       - Listar productos
POST   /api/referencias/productos       - Crear producto
PUT    /api/referencias/productos/:id   - Actualizar producto
DELETE /api/referencias/productos/:id   - Eliminar producto

GET    /api/referencias/clientes        - Listar clientes
POST   /api/referencias/clientes        - Crear cliente
PUT    /api/referencias/clientes/:id    - Actualizar cliente
DELETE /api/referencias/clientes/:id    - Eliminar cliente

GET    /api/referencias/marcas          - Listar marcas
POST   /api/referencias/marcas          - Crear marca
PUT    /api/referencias/marcas/:id      - Actualizar marca
DELETE /api/referencias/marcas/:id      - Eliminar marca

GET    /api/referencias/categorias      - Listar categorías
POST   /api/referencias/categorias      - Crear categoría
PUT    /api/referencias/categorias/:id  - Actualizar categoría
DELETE /api/referencias/categorias/:id  - Eliminar categoría

GET    /api/referencias/servicios       - Listar servicios
POST   /api/referencias/servicios       - Crear servicio
PUT    /api/referencias/servicios/:id   - Actualizar servicio
DELETE /api/referencias/servicios/:id   - Eliminar servicio
```

## Estructura de Base de Datos

### Tablas Principales
- **proveedores**: Información de proveedores
- **productos**: Catálogo de productos
- **clientes**: Base de datos de clientes
- **marcas**: Marcas de productos
- **categorias**: Categorías de productos
- **servicios**: Servicios técnicos disponibles

### Relaciones
- **productos** → **categorias** (categoria_id)
- **productos** → **marcas** (marca_id)
- **productos** → **proveedores** (proveedor_id)

## Características Técnicas

### Validaciones
- Campos requeridos según el esquema de base de datos
- Validación de formatos (email, teléfono)
- Validación de rangos numéricos
- Validación de longitud de texto

### Funcionalidades
- **Búsqueda**: Búsqueda en tiempo real por múltiples campos
- **Ordenamiento**: Ordenamiento por cualquier columna
- **Paginación**: Navegación por páginas con límites configurables
- **Estados**: Manejo de estados de carga, error y éxito
- **Confirmaciones**: Confirmación antes de eliminar registros

### Responsive Design
- Diseño adaptable a diferentes tamaños de pantalla
- Tablas responsivas con scroll horizontal en móviles
- Modales optimizados para dispositivos móviles

## Uso del Módulo

### Acceso
1. Iniciar sesión en el sistema
2. Navegar al módulo "Referencias" en el sidebar
3. Seleccionar la subcategoría deseada

### Operaciones Básicas
1. **Ver lista**: La página principal muestra todos los registros
2. **Buscar**: Usar el campo de búsqueda para filtrar resultados
3. **Crear**: Hacer clic en "Nuevo" para abrir el modal de creación
4. **Editar**: Hacer clic en el ícono de editar en la fila deseada
5. **Ver detalles**: Hacer clic en el ícono de ver en la fila deseada
6. **Eliminar**: Hacer clic en el ícono de eliminar y confirmar

### Mejores Prácticas
- Mantener los datos actualizados regularmente
- Usar descripciones claras y concisas
- Verificar la información antes de guardar
- Realizar respaldos periódicos de la información

## Mantenimiento

### Actualizaciones
- Los componentes son modulares y fáciles de actualizar
- Los tipos TypeScript aseguran la consistencia de datos
- Los hooks personalizados facilitan la reutilización de lógica

### Debugging
- Usar las herramientas de desarrollo del navegador
- Revisar la consola para errores de JavaScript
- Verificar las respuestas de la API en la pestaña Network

## Consideraciones de Seguridad

### Autenticación
- Todas las operaciones requieren autenticación
- Los tokens JWT se validan en cada request
- Las sesiones expiran automáticamente

### Autorización
- Verificar permisos antes de realizar operaciones
- Los usuarios solo pueden acceder a datos autorizados
- Registrar todas las acciones en el log de auditoría

## Soporte y Documentación

### Recursos Adicionales
- Documentación de la API en `/api/docs`
- Esquema de base de datos en `lib/sql/sys_taller_jc_v4.sql`
- Tipos TypeScript en `lib/types/referencias.ts`

### Contacto
Para soporte técnico o consultas sobre el módulo de Referencias, contactar al equipo de desarrollo.
