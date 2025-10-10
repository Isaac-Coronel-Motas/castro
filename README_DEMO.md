# 🚗 DEMO SISTEMA TALLER CASTRO

## 📋 Descripción
Conjunto de archivos SQL para crear una demo completa del Sistema Taller Castro con datos de prueba realistas que permiten probar todas las funcionalidades del sistema.

## 📁 Archivos Incluidos

### 1. `demo_01_parametros_y_referencias.sql`
- **Ciudades**: 7 ciudades principales de Costa Rica
- **Empresas**: 2 empresas del grupo Castro
- **Sucursales**: 3 sucursales operativas
- **Almacenes**: 4 almacenes distribuidos
- **Categorías**: 8 categorías de productos automotrices
- **Tipos de Documento**: 6 tipos de documentos comerciales
- **Tipos de Equipo**: 6 tipos de vehículos
- **Tipos de Diagnóstico**: 6 tipos de diagnósticos técnicos
- **Motivos de Ajuste**: 6 motivos para ajustes de inventario
- **Formas de Cobro**: 6 métodos de pago
- **Cajas Registradoras**: 4 cajas operativas
- **Servicios Técnicos**: 8 servicios principales
- **Empleados**: 6 empleados del taller

### 2. `demo_02_roles_permisos_usuarios.sql`
- **Roles**: 6 roles del sistema (Super Admin, Admin, Vendedor, Comprador, Técnico, Cajero)
- **Permisos**: 25 permisos específicos por módulo
- **Asignación de Permisos**: Permisos asignados según el rol
- **Usuarios**: 6 usuarios con contraseña `admin.2025`

### 3. `demo_03_clientes_proveedores_productos.sql`
- **Clientes**: 8 clientes con datos completos
- **Proveedores**: 6 proveedores especializados
- **Productos**: 30 productos con precios y stock realistas

### 4. `demo_04_compras_y_ventas.sql`
- **Pedidos de Compra**: 4 pedidos con detalles
- **Presupuestos Proveedor**: 3 presupuestos
- **Órdenes de Compra**: 3 órdenes confirmadas
- **Registro de Compras**: 3 compras registradas
- **Ventas**: 13 ventas con detalles completos
- **Cobros**: 12 cobros registrados

### 5. `demo_05_servicios_tecnicos_y_datos_adicionales.sql`
- **Equipos**: 8 equipos registrados
- **Solicitudes de Servicio**: 8 solicitudes
- **Recepciones**: 8 recepciones de equipo
- **Diagnósticos**: 8 diagnósticos técnicos
- **Presupuestos de Servicios**: 8 presupuestos
- **Órdenes de Servicio**: 8 órdenes de trabajo
- **Salidas de Equipo**: 5 entregas realizadas
- **Reclamos**: 3 reclamos gestionados
- **Ajustes de Inventario**: 3 ajustes realizados
- **Transferencias**: 3 transferencias entre almacenes
- **Notas de Crédito/Débito**: 4 notas comerciales
- **Notas de Remisión**: 3 remisiones

## 🚀 Instrucciones de Instalación

### 1. Preparación de la Base de Datos
```sql
-- Ejecutar en orden los archivos SQL:
-- 1. demo_01_parametros_y_referencias.sql
-- 2. demo_02_roles_permisos_usuarios.sql
-- 3. demo_03_clientes_proveedores_productos.sql
-- 4. demo_04_compras_y_ventas.sql
-- 5. demo_05_servicios_tecnicos_y_datos_adicionales.sql
```

### 2. Usuarios de Acceso

#### 🔑 Super Administrador
- **Usuario**: `admin`
- **Contraseña**: `admin.2025`
- **Permisos**: Acceso completo a todos los módulos

#### 👥 Usuarios por Módulo

**Ventas:**
- **Usuario**: `jperez` | **Contraseña**: `admin.2025`
- **Usuario**: `mgonzalez` | **Contraseña**: `admin.2025`

**Compras:**
- **Usuario**: `lhernandez` | **Contraseña**: `admin.2025`

**Servicios Técnicos:**
- **Usuario**: `crodriguez` | **Contraseña**: `admin.2025`
- **Usuario**: `amartinez` | **Contraseña**: `admin.2025`

## 🎯 Funcionalidades para Demo

### 📊 Módulo de Ventas
- ✅ Gestión de clientes
- ✅ Registro de ventas
- ✅ Procesamiento de cobros
- ✅ Presupuestos de venta
- ✅ Notas de remisión
- ✅ Notas de crédito/débito
- ✅ Informes de ventas

### 🛒 Módulo de Compras
- ✅ Gestión de proveedores
- ✅ Pedidos de compra
- ✅ Presupuestos proveedor
- ✅ Órdenes de compra
- ✅ Registro de compras
- ✅ Ajustes de inventario
- ✅ Transferencias de stock
- ✅ Informes de compras

### 🔧 Módulo de Servicios Técnicos
- ✅ Solicitudes de servicio
- ✅ Recepción de equipos
- ✅ Diagnósticos técnicos
- ✅ Presupuestos de servicios
- ✅ Órdenes de servicio
- ✅ Retiro de equipos
- ✅ Gestión de reclamos
- ✅ Informes de servicios

### 📈 Módulo de Informes
- ✅ Dashboard consolidado
- ✅ Informes por módulo
- ✅ Filtros avanzados
- ✅ Exportación de datos
- ✅ Métricas y tendencias

## 📋 Datos de Prueba Incluidos

### 💰 Transacciones Financieras
- **Ventas**: ₡2,850,000 en 13 transacciones
- **Compras**: ₡1,350,000 en 3 compras
- **Servicios**: ₡350,000 en 8 servicios
- **Cobros**: ₡2,370,000 procesados

### 📦 Inventario
- **Productos**: 30 productos con stock realista
- **Categorías**: 8 categorías especializadas
- **Proveedores**: 6 proveedores especializados
- **Almacenes**: 4 almacenes distribuidos

### 👥 Clientes y Servicios
- **Clientes**: 8 clientes activos
- **Equipos**: 8 equipos registrados
- **Servicios**: 8 servicios técnicos completados
- **Reclamos**: 3 reclamos resueltos

## 🎪 Escenarios de Demo

### 1. **Flujo Completo de Venta**
1. Crear nueva venta
2. Agregar productos al carrito
3. Procesar cobro
4. Generar factura
5. Verificar en informes

### 2. **Flujo Completo de Compra**
1. Crear pedido de compra
2. Solicitar presupuesto
3. Confirmar orden de compra
4. Registrar compra
5. Actualizar inventario

### 3. **Flujo Completo de Servicio**
1. Recibir solicitud de servicio
2. Realizar diagnóstico
3. Crear presupuesto
4. Ejecutar orden de servicio
5. Entregar equipo
6. Gestionar reclamos si aplica

### 4. **Análisis de Informes**
1. Revisar dashboard principal
2. Analizar informes por módulo
3. Aplicar filtros de fecha
4. Exportar datos
5. Identificar tendencias

## 🔧 Configuración Adicional

### Base de Datos
- **Motor**: PostgreSQL
- **Esquema**: `public`
- **Charset**: UTF-8

### Aplicación
- **Framework**: Next.js 14
- **Base de Datos**: PostgreSQL con Neon
- **Autenticación**: JWT
- **UI**: Shadcn/ui + Tailwind CSS

## 📞 Soporte

Para cualquier consulta sobre la demo o el sistema:
- **Email**: admin@tallercastro.com
- **Usuario**: admin
- **Contraseña**: admin.2025

---

**¡Disfruta explorando el Sistema Taller Castro!** 🚗✨
