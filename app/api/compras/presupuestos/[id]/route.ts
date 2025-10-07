import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validatePresupuestoProveedorData, 
  canProcessPresupuesto
} from '@/lib/utils/compras';
import { 
  mapEstadoForDatabase,
  mapEstadoForFrontend,
  sanitizeForLog 
} from '@/lib/utils/compras-server';
import { 
  UpdatePresupuestoProveedorRequest, 
  ComprasApiResponse 
} from '@/lib/types/compras';

// ===== GET - Obtener presupuesto proveedor individual =====
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

    // Query para obtener presupuesto
    const presupuestoQuery = `
      SELECT 
        pp.presu_prov_id,
        pp.usuario_id,
        pp.fecha_presupuesto,
        pp.estado,
        pp.observaciones,
        pp.monto_presu_prov,
        pp.nro_comprobante,
        pp.pedido_prov_id,
        u.nombre as usuario_nombre,
        pr.nombre_proveedor as proveedor_nombre,
        pr.proveedor_id
      FROM presupuesto_proveedor pp
      LEFT JOIN usuarios u ON pp.usuario_id = u.usuario_id
      LEFT JOIN pedido_proveedor pv ON pp.pedido_prov_id = pv.pedido_prov_id
      LEFT JOIN proveedores pr ON pv.proveedor_id = pr.proveedor_id
      WHERE pp.presu_prov_id = $1
    `;

    const presupuestoResult = await pool.query(presupuestoQuery, [presupuestoId]);

    if (presupuestoResult.rows.length === 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'Presupuesto proveedor no encontrado',
        error: 'No encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const presupuesto = {
      ...presupuestoResult.rows[0],
      estado: mapEstadoForFrontend(presupuestoResult.rows[0].estado)
    };

    const response: ComprasApiResponse = {
      success: true,
      message: 'Presupuesto proveedor obtenido exitosamente',
      data: presupuesto
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error obteniendo presupuesto proveedor:', error);
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error obteniendo presupuesto proveedor'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// ===== PUT - Actualizar presupuesto proveedor =====
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('compras.editar')(request);
    
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

    const body: UpdatePresupuestoProveedorRequest = await request.json();

    // Validar datos
    const validation = validatePresupuestoProveedorData(body);
    if (!validation.valid) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el presupuesto existe
    const existingPresupuesto = await pool.query(
      'SELECT * FROM presupuesto_proveedor WHERE presu_prov_id = $1',
      [presupuestoId]
    );

    if (existingPresupuesto.rows.length === 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'Presupuesto proveedor no encontrado',
        error: 'No encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si el presupuesto puede ser modificado
    if (body.estado && !canProcessPresupuesto(existingPresupuesto.rows[0].estado)) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'No se puede modificar un presupuesto que ya ha sido procesado',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Construir query de actualización
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 0;

    if (body.fecha_presupuesto !== undefined) {
      paramCount++;
      updateFields.push(`fecha_presupuesto = $${paramCount}`);
      updateValues.push(body.fecha_presupuesto);
    }

    if (body.estado !== undefined) {
      paramCount++;
      updateFields.push(`estado = $${paramCount}`);
      updateValues.push(mapEstadoForDatabase(body.estado));
    }

    if (body.observaciones !== undefined) {
      paramCount++;
      updateFields.push(`observaciones = $${paramCount}`);
      updateValues.push(body.observaciones);
    }

    if (body.monto_presu_prov !== undefined) {
      paramCount++;
      updateFields.push(`monto_presu_prov = $${paramCount}`);
      updateValues.push(body.monto_presu_prov);
    }

    if (body.proveedor_id !== undefined) {
      paramCount++;
      updateFields.push(`pedido_prov_id = $${paramCount}`);
      updateValues.push(body.proveedor_id);
    }

    if (updateFields.length === 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'No hay campos para actualizar',
        error: 'Sin cambios'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Actualizar presupuesto
    paramCount++;
    updateValues.push(presupuestoId);

    const updateQuery = `
      UPDATE presupuesto_proveedor 
      SET ${updateFields.join(', ')}
      WHERE presu_prov_id = $${paramCount}
    `;

    await pool.query(updateQuery, updateValues);

    // Obtener presupuesto actualizado
    const getPresupuestoQuery = `
      SELECT 
        pp.presu_prov_id,
        pp.usuario_id,
        pp.fecha_presupuesto,
        pp.estado,
        pp.observaciones,
        pp.monto_presu_prov,
        pp.nro_comprobante,
        pp.pedido_prov_id,
        u.nombre as usuario_nombre,
        pr.nombre_proveedor as proveedor_nombre
      FROM presupuesto_proveedor pp
      LEFT JOIN usuarios u ON pp.usuario_id = u.usuario_id
      LEFT JOIN pedido_proveedor pv ON pp.pedido_prov_id = pv.pedido_prov_id
      LEFT JOIN proveedores pr ON pv.proveedor_id = pr.proveedor_id
      WHERE pp.presu_prov_id = $1
    `;

    const presupuestoData = await pool.query(getPresupuestoQuery, [presupuestoId]);

    const response: ComprasApiResponse = {
      success: true,
      message: 'Presupuesto proveedor actualizado exitosamente',
      data: {
        ...presupuestoData.rows[0],
        estado: mapEstadoForFrontend(presupuestoData.rows[0].estado)
      }
    };

    // Log de auditoría
    console.log('Presupuesto proveedor actualizado:', sanitizeForLog({
      presu_prov_id: presupuestoId,
      cambios: body,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error actualizando presupuesto proveedor:', error);
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error actualizando presupuesto proveedor'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// ===== DELETE - Eliminar presupuesto proveedor =====
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('compras.eliminar')(request);
    
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

    // Verificar que el presupuesto existe
    const existingPresupuesto = await pool.query(
      'SELECT * FROM presupuesto_proveedor WHERE presu_prov_id = $1',
      [presupuestoId]
    );

    if (existingPresupuesto.rows.length === 0) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'Presupuesto proveedor no encontrado',
        error: 'No encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si el presupuesto puede ser eliminado
    if (!canProcessPresupuesto(existingPresupuesto.rows[0].estado)) {
      const response: ComprasApiResponse = {
        success: false,
        message: 'No se puede eliminar un presupuesto que ya ha sido procesado',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Eliminar presupuesto
    await pool.query('DELETE FROM presupuesto_proveedor WHERE presu_prov_id = $1', [presupuestoId]);

    const response: ComprasApiResponse = {
      success: true,
      message: 'Presupuesto proveedor eliminado exitosamente'
    };

    // Log de auditoría
    console.log('Presupuesto proveedor eliminado:', sanitizeForLog({
      presu_prov_id: presupuestoId,
      nro_comprobante: existingPresupuesto.rows[0].nro_comprobante,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error eliminando presupuesto proveedor:', error);
    const response: ComprasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error eliminando presupuesto proveedor'
    };
    return NextResponse.json(response, { status: 500 });
  }
}