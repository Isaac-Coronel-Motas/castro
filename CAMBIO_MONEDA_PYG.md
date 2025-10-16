# Cambio de Moneda: De Colón Costarricense (₡) a Guaraní Paraguayo (PYG)

## Resumen del Cambio

Se ha actualizado el sistema para cambiar la moneda de Colón Costarricense (₡) a Guaraní Paraguayo (PYG) en toda la aplicación.

## Archivos Modificados

### Componentes de Modales
- `components/modals/presupuesto-proveedor-modal.tsx`
- `components/modals/agregar-producto-presupuesto-modal.tsx`

### Utilidades de Formateo
- `lib/utils/currency.ts` (nuevo archivo)
- `lib/utils/compras.ts`
- `lib/utils/referencias.ts`
- `lib/utils/ventas.ts`
- `lib/utils/servicios-tecnicos.ts`

### Páginas
- `app/compras/presupuestos/page.tsx`
- `app/dashboard/page.tsx`

## Cambios Realizados

### 1. Símbolo de Moneda
**Antes**: ₡ (Colón Costarricense)
**Después**: PYG (Guaraní Paraguayo)

### 2. Formato de Números
- Se mantiene el formato de números con separadores de miles
- Se usa la configuración regional de Paraguay (`es-PY`)
- Ejemplo: `PYG 150,000` en lugar de `₡150,000`

### 3. Funciones de Formateo
Se creó una función centralizada en `lib/utils/currency.ts`:

```typescript
export function formatCurrency(amount: number): string {
  return `PYG ${amount.toLocaleString('es-PY')}`;
}
```

### 4. Ubicaciones Específicas Cambiadas

#### Modal de Presupuesto Proveedor
- Monto Total: `PYG {amount}`
- Detalles de productos: `Cantidad: {cantidad} × PYG {precio} = PYG {total}`
- Monto calculado: `PYG {amount}`

#### Modal de Agregar Producto
- Precio del producto: `PYG {precio}`
- Precio sugerido: `PYG {precio}`
- Subtotal: `PYG {subtotal}`

#### Página de Presupuestos
- Columna de monto en tabla: `PYG {amount}`
- Métricas de valor estimado: `PYG {amount}`

#### Dashboard
- Ventas del día: `PYG 2.450.000`
- Ingresos del mes: `PYG 45.200.000`

## Beneficios del Cambio

1. **Consistencia**: Todas las monedas ahora usan el mismo formato PYG
2. **Claridad**: El símbolo PYG es más descriptivo que ₡
3. **Localización**: Configuración regional específica para Paraguay
4. **Mantenibilidad**: Función centralizada para formateo de moneda

## Archivos que Aún Pueden Contener ₡

Los siguientes archivos pueden contener referencias al símbolo ₡ que no han sido modificados:

- `components/modals/pedido-compra-modal.tsx`
- `app/ventas/registro/page.tsx`
- `app/compras/pedidos-de-compra/page.tsx`
- `components/modals/nota-credito-debito-modal.tsx`
- `app/compras/notas/page.tsx`
- `app/compras/ajustes/page.tsx`
- `app/compras/registro/page.tsx`
- `app/compras/ordenes/page.tsx`
- `scripts/setup-caja-data.js`
- `components/modals/solicitud-servicio-modal.tsx`
- `components/modals/salida-equipo-modal.tsx`
- `components/modals/presupuesto-servicio-modal.tsx`
- `components/modals/nota-modal.tsx`
- `components/modals/modal-nueva-venta.tsx`
- `components/modals/cierre-caja-modal.tsx`
- `app/ventas/notas-credito-debito/page.tsx`
- `app/ventas/apertura-cierre-caja/page.tsx`
- `app/servicios/retiro-equipos/page.tsx`
- `app/servicios/presupuestos/page.tsx`
- `app/administracion/auditoria/page.tsx`

## Recomendaciones

1. **Revisar archivos restantes**: Se recomienda revisar y actualizar los archivos listados arriba
2. **Usar función centralizada**: Para futuros desarrollos, usar `formatCurrency()` de `lib/utils/currency.ts`
3. **Consistencia**: Mantener el formato `PYG {amount}` en toda la aplicación
4. **Testing**: Probar todas las funcionalidades que muestran montos para asegurar el correcto formateo

## Comando para Cambio Masivo (Opcional)

Si se desea cambiar todos los símbolos ₡ restantes por PYG, se puede usar:

```bash
# PowerShell
Get-ChildItem -Path . -Recurse -Include '*.tsx','*.ts','*.js' | ForEach-Object { (Get-Content $_.FullName) -replace '₡', 'PYG ' | Set-Content $_.FullName }

# Bash/Linux
find . -name "*.tsx" -o -name "*.ts" -o -name "*.js" | xargs sed -i 's/₡/PYG /g'
```

**Nota**: Usar con precaución y hacer backup antes de ejecutar comandos masivos.
