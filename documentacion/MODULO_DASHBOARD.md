# Módulo Dashboard

## Descripción General

El Dashboard es el módulo principal del sistema que proporciona una vista consolidada de métricas clave, indicadores de rendimiento y accesos rápidos a las funcionalidades principales del sistema.

## Funcionalidades

### 📊 Métricas Principales
- **Total de Ventas**: Suma de todas las ventas registradas
- **Total de Compras**: Suma de todas las compras realizadas
- **Total de Servicios**: Cantidad de servicios técnicos realizados
- **Usuarios Activos**: Número de usuarios conectados

### 📈 Indicadores de Rendimiento
- **Tendencias Mensuales**: Gráficos de evolución por mes
- **Distribución por Módulo**: Porcentajes de actividad por área
- **Top Clientes**: Clientes con mayor actividad
- **Top Proveedores**: Proveedores más utilizados

### 🚀 Accesos Rápidos
- **Nueva Venta**: Acceso directo al registro de ventas
- **Nueva Compra**: Acceso directo a pedidos de compra
- **Nuevo Servicio**: Acceso directo a solicitudes de servicio
- **Reportes**: Acceso a informes consolidados

## Estructura de Archivos

```
app/dashboard/
├── page.tsx                 # Página principal del dashboard
├── loading.tsx              # Componente de carga
└── layout.tsx               # Layout específico (si existe)

components/
├── dashboard/               # Componentes específicos del dashboard
│   ├── metrics-cards.tsx   # Tarjetas de métricas
│   ├── charts-section.tsx  # Sección de gráficos
│   └── quick-actions.tsx   # Acciones rápidas
```

## APIs Relacionadas

### GET `/api/dashboard/metrics`
Obtiene las métricas principales del dashboard.

**Respuesta:**
```typescript
{
  ventas: {
    total: number;
    mes_actual: number;
    tendencia: number;
  };
  compras: {
    total: number;
    mes_actual: number;
    tendencia: number;
  };
  servicios: {
    total: number;
    mes_actual: number;
    tendencia: number;
  };
  usuarios: {
    activos: number;
    total: number;
  };
}
```

### GET `/api/dashboard/charts`
Obtiene datos para gráficos del dashboard.

**Respuesta:**
```typescript
{
  tendencias_mensuales: Array<{
    mes: string;
    ventas: number;
    compras: number;
    servicios: number;
  }>;
  distribucion_modulos: Array<{
    modulo: string;
    porcentaje: number;
    cantidad: number;
  }>;
  top_clientes: Array<{
    cliente_id: number;
    nombre: string;
    total_ventas: number;
  }>;
  top_proveedores: Array<{
    proveedor_id: number;
    nombre: string;
    total_compras: number;
  }>;
}
```

## Componentes Principales

### DashboardPage
Componente principal que renderiza el dashboard completo.

**Props:**
```typescript
interface DashboardPageProps {
  // No recibe props específicas
}
```

**Funcionalidades:**
- Carga de métricas principales
- Renderizado de gráficos
- Manejo de estados de carga y error
- Actualización automática de datos

### MetricsCards
Componente que muestra las tarjetas de métricas principales.

**Props:**
```typescript
interface MetricsCardsProps {
  metrics: DashboardMetrics;
  loading?: boolean;
}
```

**Funcionalidades:**
- Display de métricas numéricas
- Indicadores de tendencia
- Estados de carga
- Formateo de números

### ChartsSection
Componente que contiene los gráficos del dashboard.

**Props:**
```typescript
interface ChartsSectionProps {
  chartData: DashboardCharts;
  loading?: boolean;
}
```

**Funcionalidades:**
- Gráficos de tendencias
- Gráficos de distribución
- Interactividad con gráficos
- Responsive design

## Hooks Personalizados

### useDashboardMetrics
Hook para manejar las métricas del dashboard.

```typescript
const {
  metrics,
  loading,
  error,
  fetchMetrics,
  refetchMetrics
} = useDashboardMetrics();
```

**Funcionalidades:**
- Carga automática de métricas
- Manejo de estados de carga y error
- Función de refetch
- Cache de datos

### useDashboardCharts
Hook para manejar los datos de gráficos.

```typescript
const {
  chartData,
  loading,
  error,
  fetchChartData,
  refetchChartData
} = useDashboardCharts();
```

**Funcionalidades:**
- Carga de datos para gráficos
- Manejo de estados
- Función de refetch
- Optimización de re-renders

## Tipos TypeScript

### DashboardMetrics
```typescript
interface DashboardMetrics {
  ventas: {
    total: number;
    mes_actual: number;
    tendencia: number;
  };
  compras: {
    total: number;
    mes_actual: number;
    tendencia: number;
  };
  servicios: {
    total: number;
    mes_actual: number;
    tendencia: number;
  };
  usuarios: {
    activos: number;
    total: number;
  };
}
```

### DashboardCharts
```typescript
interface DashboardCharts {
  tendencias_mensuales: Array<{
    mes: string;
    ventas: number;
    compras: number;
    servicios: number;
  }>;
  distribucion_modulos: Array<{
    modulo: string;
    porcentaje: number;
    cantidad: number;
  }>;
  top_clientes: Array<{
    cliente_id: number;
    nombre: string;
    total_ventas: number;
  }>;
  top_proveedores: Array<{
    proveedor_id: number;
    nombre: string;
    total_compras: number;
  }>;
}
```

## Permisos Requeridos

- `dashboard.ver` - Ver el dashboard principal
- `dashboard.metricas` - Ver métricas detalladas
- `dashboard.graficos` - Ver gráficos y estadísticas

## Configuración

### Variables de Entorno
```env
DASHBOARD_REFRESH_INTERVAL=30000  # Intervalo de actualización en ms
DASHBOARD_CACHE_TTL=300000        # TTL del cache en ms
DASHBOARD_MAX_METRICS=50         # Máximo de métricas a mostrar
```

### Configuración de Gráficos
```typescript
const chartConfig = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Dashboard Metrics'
    }
  }
};
```

## Optimizaciones

### Performance
- **Lazy Loading**: Carga diferida de componentes pesados
- **Memoization**: Uso de React.memo para componentes estáticos
- **Virtual Scrolling**: Para listas largas de datos
- **Image Optimization**: Optimización automática de imágenes

### Caching
- **Client-side**: Cache en memoria para métricas
- **Server-side**: Cache de consultas de base de datos
- **CDN**: Cache de assets estáticos

### Responsive Design
- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: Adaptación a diferentes tamaños de pantalla
- **Touch Friendly**: Interfaz táctil optimizada

## Testing

### Unit Tests
```typescript
describe('DashboardPage', () => {
  it('should render metrics cards', () => {
    // Test implementation
  });
  
  it('should handle loading state', () => {
    // Test implementation
  });
  
  it('should handle error state', () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
describe('Dashboard Integration', () => {
  it('should load metrics on mount', () => {
    // Test implementation
  });
  
  it('should refresh data on interval', () => {
    // Test implementation
  });
});
```

## Troubleshooting

### Problemas Comunes

1. **Métricas no cargan**
   - Verificar conexión a la base de datos
   - Revisar permisos del usuario
   - Verificar logs de error

2. **Gráficos no se renderizan**
   - Verificar datos de entrada
   - Revisar configuración de Chart.js
   - Verificar dependencias

3. **Performance lenta**
   - Revisar consultas de base de datos
   - Optimizar componentes
   - Implementar lazy loading

### Logs de Debug
```typescript
console.log('Dashboard metrics loaded:', metrics);
console.log('Chart data loaded:', chartData);
console.log('Dashboard render time:', renderTime);
```

## Roadmap

### Próximas Funcionalidades
- [ ] Dashboard personalizable por usuario
- [ ] Widgets arrastrables
- [ ] Notificaciones en tiempo real
- [ ] Exportación de reportes
- [ ] Comparativas de períodos
- [ ] Alertas automáticas

### Mejoras Técnicas
- [ ] WebSockets para actualizaciones en tiempo real
- [ ] Service Workers para offline
- [ ] PWA capabilities
- [ ] Advanced caching strategies
- [ ] Performance monitoring
