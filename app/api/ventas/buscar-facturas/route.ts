import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';

// GET /api/ventas/buscar-facturas - Buscar facturas por número
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const numeroFactura = searchParams.get('numero') || '';
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!numeroFactura.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Número de factura es requerido',
        error: 'Parámetro faltante'
      }, { status: 400 });
    }

    // Buscar facturas que coincidan con el número
    const query = `
      SELECT 
        v.venta_id,
        v.tipo_documento,
        v.nro_factura,
        v.fecha_venta,
        v.monto_venta,
        v.estado,
        v.condicion_pago,
        c.cliente_id,
        c.nombre as cliente_nombre,
        c.email as cliente_email,
        c.telefono as cliente_telefono,
        s.nombre as sucursal_nombre,
        u.nombre as usuario_nombre,
        CASE 
          WHEN v.estado = 'abierto' THEN 'Abierto'
          WHEN v.estado = 'cerrado' THEN 'Cerrado'
          WHEN v.estado = 'cancelado' THEN 'Cancelado'
          ELSE v.estado
        END as estado_display
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.cliente_id
      LEFT JOIN sucursales s ON v.sucursal_id = s.sucursal_id
      LEFT JOIN usuarios u ON v.usuario_id = u.usuario_id
      WHERE v.nro_factura ILIKE $1
         OR v.tipo_documento ILIKE $1
      ORDER BY v.fecha_venta DESC
      LIMIT $2
    `;

    const searchPattern = `%${numeroFactura}%`;
    const result = await pool.query(query, [searchPattern, limit]);
    
    const facturas = result.rows.map(factura => ({
      venta_id: factura.venta_id,
      tipo_documento: factura.tipo_documento,
      nro_factura: factura.nro_factura,
      fecha_venta: factura.fecha_venta,
      monto_venta: parseFloat(factura.monto_venta || '0'),
      estado: factura.estado,
      estado_display: factura.estado_display,
      condicion_pago: factura.condicion_pago,
      cliente: {
        cliente_id: factura.cliente_id,
        nombre: factura.cliente_nombre,
        email: factura.cliente_email,
        telefono: factura.cliente_telefono
      },
      sucursal_nombre: factura.sucursal_nombre,
      usuario_nombre: factura.usuario_nombre
    }));

    const response = {
      success: true,
      message: 'Facturas encontradas exitosamente',
      data: facturas,
      total: facturas.length
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al buscar facturas:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
