import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { ComprasApiResponse } from '@/lib/types/compras';

// ===== GET - Obtener detalles de un presupuesto proveedor =====
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('compras.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const presupuestoId = parseInt(params.id);

    if (isNaN(presupuestoId)) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'ID de presupuesto inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Query para obtener detalles del presupuesto
    const detallesQuery = `
      SELECT 
        dp.detalle_presup_id,
        dp.presu_prov_id,
        dp.producto_id,
        dp.cantidad,
        dp.precio_unitario,
        p.nombre_producto,
        p.cod_product,
        p.descripcion_producto,
        (dp.cantidad * dp.precio_unitario) as subtotal
      FROM detalle_presupuesto dp
      LEFT JOIN productos p ON dp.producto_id = p.producto_id
      WHERE dp.presu_prov_id = $1
      ORDER BY dp.detalle_presup_id
    `;

    const detallesResult = await pool.query(detallesQuery, [presupuestoId]);

    const response: ComprasApiResponse = {
      success: true,
      message: 'Detalles del presupuesto obtenidos exitosamente',
      data: detallesResult.rows
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error obteniendo detalles del presupuesto:', error);
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error obteniendo detalles del presupuesto'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// ===== POST - Crear detalle de presupuesto =====
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('compras.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const presupuestoId = parseInt(params.id);
    const body = await request.json();

    if (isNaN(presupuestoId)) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'ID de presupuesto inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Validar datos del detalle
    if (!body.producto_id || !body.cantidad || !body.precio_unitario) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'Datos de detalle inválidos',
        error: 'producto_id, cantidad y precio_unitario son requeridos'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Crear detalle
    const createDetalleQuery = `
      INSERT INTO detalle_presupuesto (
        presu_prov_id, producto_id, cantidad, precio_unitario
      ) VALUES ($1, $2, $3, $4)
      RETURNING detalle_presup_id
    `;

    const detalleResult = await pool.query(createDetalleQuery, [
      presupuestoId,
      body.producto_id,
      body.cantidad,
      body.precio_unitario
    ]);

    const newDetalleId = detalleResult.rows[0].detalle_presup_id;

    // Obtener detalle creado con información del producto
    const getDetalleQuery = `
      SELECT 
        dp.detalle_presup_id,
        dp.presu_prov_id,
        dp.producto_id,
        dp.cantidad,
        dp.precio_unitario,
        p.nombre_producto,
        p.cod_product,
        p.descripcion_producto,
        (dp.cantidad * dp.precio_unitario) as subtotal
      FROM detalle_presupuesto dp
      LEFT JOIN productos p ON dp.producto_id = p.producto_id
      WHERE dp.detalle_presup_id = $1
    `;

    const detalleData = await pool.query(getDetalleQuery, [newDetalleId]);

    const response: ComprasApiResponse = {
      success: true,
      message: 'Detalle de presupuesto creado exitosamente',
      data: detalleData.rows[0]
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error creando detalle de presupuesto:', error);
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error creando detalle de presupuesto'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
