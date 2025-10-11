# Documentación del Sistema Taller Castro

## Índice de Documentación

Este directorio contiene la documentación técnica completa de cada módulo del sistema Taller Castro. Cada archivo README proporciona información detallada sobre funcionalidades, estructura de APIs, organización de carpetas y aspectos técnicos específicos.

### 📁 Estructura de Documentación

- **[README_GENERAL.md](./README_GENERAL.md)** - Este archivo (índice general)
- **[MODULO_DASHBOARD.md](./MODULO_DASHBOARD.md)** - Dashboard principal y métricas generales
- **[MODULO_COMPRAS.md](./MODULO_COMPRAS.md)** - Gestión de compras y proveedores
- **[MODULO_VENTAS.md](./MODULO_VENTAS.md)** - Gestión de ventas y clientes
- **[MODULO_SERVICIOS_TECNICOS.md](./MODULO_SERVICIOS_TECNICOS.md)** - Servicios técnicos y equipos
- **[MODULO_REFERENCIAS.md](./MODULO_REFERENCIAS.md)** - Catálogos y datos maestros
- **[MODULO_ADMINISTRACION.md](./MODULO_ADMINISTRACION.md)** - Administración del sistema
- **[MODULO_AUTENTICACION.md](./MODULO_AUTENTICACION.md)** - Autenticación y seguridad
- **[ESTRUCTURA_TECNICA.md](./ESTRUCTURA_TECNICA.md)** - Arquitectura técnica general

### 🏗️ Arquitectura General

El sistema está construido con **Next.js 14** usando **App Router** y las siguientes tecnologías principales:

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, PostgreSQL
- **Autenticación**: JWT con middleware personalizado
- **Base de Datos**: PostgreSQL con pool de conexiones
- **Estado**: React Hooks personalizados
- **UI Components**: shadcn/ui + Lucide React

### 📊 Módulos del Sistema

#### 1. **Dashboard** (`/dashboard`)
- Métricas generales del sistema
- Indicadores de rendimiento
- Accesos rápidos a funciones principales

#### 2. **Compras** (`/compras`)
- Gestión de pedidos de compra
- Presupuestos de proveedores
- Órdenes de compra
- Registro de compras
- Ajustes de inventario
- Notas de crédito/débito
- Transferencias de stock
- Informes de compras

#### 3. **Ventas** (`/ventas`)
- Gestión de pedidos de clientes
- Registro de ventas
- Cobros y pagos
- Presupuestos de servicios
- Notas de remisión
- Notas de crédito/débito
- Apertura/cierre de caja
- Informes de ventas

#### 4. **Servicios Técnicos** (`/servicios`)
- Solicitudes de cliente
- Recepción de equipos
- Diagnósticos técnicos
- Presupuestos de servicios
- Órdenes de servicio
- Retiro de equipos
- Reclamos
- Informes de servicios

#### 5. **Referencias** (`/referencias`)
- Gestión de productos
- Catálogo de categorías
- Gestión de clientes
- Gestión de proveedores
- Marcas y tipos de servicio
- Almacenes y sucursales

#### 6. **Administración** (`/administracion`)
- Gestión de usuarios
- Roles y permisos
- Auditoría del sistema
- Configuración general

### 🔧 Estructura Técnica

#### Frontend (`/app`)
```
app/
├── (auth)/                 # Rutas de autenticación
├── dashboard/              # Dashboard principal
├── compras/                # Módulo de compras
├── ventas/                 # Módulo de ventas
├── servicios/              # Módulo de servicios técnicos
├── referencias/            # Módulo de referencias
├── administracion/         # Módulo de administración
└── api/                    # API Routes
```

#### Componentes (`/components`)
```
components/
├── ui/                     # Componentes base (shadcn/ui)
├── modals/                 # Modales del sistema
├── informes/               # Componentes de informes (compras)
├── informes-servicios/     # Componentes de informes (servicios)
├── informes-ventas/        # Componentes de informes (ventas)
├── app-layout.tsx          # Layout principal
├── data-table.tsx          # Tabla de datos reutilizable
└── protected-route.tsx     # Protección de rutas
```

#### Hooks Personalizados (`/hooks`)
```
hooks/
├── use-api.ts              # Hook base para APIs
├── use-authenticated-fetch.ts # Fetch con autenticación
├── use-cobros.ts           # Hook para cobros
├── use-notas-remision.ts   # Hook para notas de remisión
├── use-presupuestos.ts     # Hook para presupuestos
├── use-ventas.ts           # Hook para ventas
└── use-toast.ts            # Hook para notificaciones
```

#### Tipos TypeScript (`/lib/types`)
```
lib/types/
├── auth.ts                 # Tipos de autenticación
├── cobros.ts               # Tipos de cobros
├── compras.ts              # Tipos de compras
├── informes.ts             # Tipos de informes
├── notas-remision.ts       # Tipos de notas de remisión
├── presupuestos.ts         # Tipos de presupuestos
├── referencias.ts          # Tipos de referencias
├── servicios-tecnicos.ts   # Tipos de servicios técnicos
└── ventas.ts               # Tipos de ventas
```

### 🔐 Sistema de Autenticación

- **JWT Tokens**: Autenticación basada en tokens
- **Middleware**: Verificación de permisos por ruta
- **Roles**: Sistema de roles jerárquico
- **Permisos**: Permisos granulares por módulo

### 📱 Responsive Design

- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: Tailwind CSS responsive
- **Touch Friendly**: Interfaz táctil optimizada
- **Progressive Web App**: Capacidades PWA

### 🎨 Sistema de Diseño

- **Design System**: shadcn/ui como base
- **Colores**: Paleta consistente
- **Tipografía**: Sistema tipográfico unificado
- **Iconos**: Lucide React
- **Espaciado**: Sistema de espaciado consistente

### 📈 Rendimiento

- **Code Splitting**: Carga diferida de módulos
- **Image Optimization**: Optimización automática de imágenes
- **Caching**: Estrategias de caché inteligentes
- **Bundle Analysis**: Análisis de tamaño de bundles

### 🧪 Testing

- **Unit Tests**: Tests unitarios con Jest
- **Integration Tests**: Tests de integración
- **E2E Tests**: Tests end-to-end con Playwright
- **Type Safety**: TypeScript para seguridad de tipos

### 🚀 Deployment

- **Vercel**: Plataforma de despliegue principal
- **Environment Variables**: Configuración por ambiente
- **Database**: PostgreSQL (Neon en producción)
- **CDN**: Distribución global de contenido

### 📚 Recursos Adicionales

- **API Documentation**: Documentación completa de APIs
- **Database Schema**: Esquema de base de datos
- **Component Library**: Biblioteca de componentes
- **Style Guide**: Guía de estilos
- **Contributing Guide**: Guía de contribución

---

Para información detallada de cada módulo, consulta los archivos README específicos en este directorio.
