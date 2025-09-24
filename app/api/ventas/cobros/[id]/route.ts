import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { sanitizeForLog } from '@/lib/utils/ventas';

// GET /api/ventas/cobros/[id] - Obtener cobro específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cobroId = parseInt(params.id);

    if (isNaN(cobroId)) {
      const response = {
        success: false,
        message: 'ID de cobro inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Consulta principal
    const query = `
      SELECT 
        c.cobro_id,
        c.venta_id,
        c.fecha_cobro,
        c.monto,
        c.usuario_id,
        c.caja_id,
        c.observacion,
        v.nro_factura,
        v.monto_venta as venta_total,
        v.fecha_venta,
        cl.nombre as cliente_nombre,
        cl.telefono as cliente_telefono,
        u.nombre as usuario_nombre,
        caja.nro_caja as caja_nro,
        s.nombre as sucursal_nombre,
        fc.nombre as forma_cobro_nombre,
        CONCAT('COB-', LPAD(c.cobro_id::text, 4, '0')) as codigo_cobro
      FROM cobros c
      LEFT JOIN ventas v ON c.venta_id = v.venta_id
      LEFT JOIN clientes cl ON v.cliente_id = cl.cliente_id
      LEFT JOIN usuarios u ON c.usuario_id = u.usuario_id
      LEFT JOIN cajas caja ON c.caja_id = caja.caja_id
      LEFT JOIN sucursales s ON caja.sucursal_id = s.sucursal_id
      LEFT JOIN formas_cobro fc ON v.forma_cobro_id = fc.forma_cobro_id
      WHERE c.cobro_id = $1
    `;

    const result = await pool.query(query, [cobroId]);
    
    if (result.rows.length === 0) {
      const response = {
        success: false,
        message: 'Cobro no encontrado',
        error: 'Cobro no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response = {
      success: true,
      message: 'Cobro obtenido exitosamente',
      data: result.rows[0]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener cobro:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/ventas/cobros/[id] - Actualizar cobro
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cobroId = parseInt(params.id);

    if (isNaN(cobroId)) {
      const response = {
        success: false,
        message: 'ID de cobro inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.actualizar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body = await request.json();
    const { monto, caja_id, observacion, usuario_id } = body;

    // Verificar que el cobro existe
    const existingCobroQuery = 'SELECT cobro_id FROM cobros WHERE cobro_id = $1';
    const existingCobro = await pool.query(existingCobroQuery, [cobroId]);
    
    if (existingCobro.rows.length === 0) {
      const response = {
        success: false,
        message: 'Cobro no encontrado',
        error: 'Cobro no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar que la caja existe si se proporciona
    if (caja_id) {
      const cajaQuery = 'SELECT caja_id, activo FROM cajas WHERE caja_id = $1';
      const cajaResult = await pool.query(cajaQuery, [caja_id]);
      
      if (cajaResult.rows.length === 0) {
        const response = {
          success: false,
          message: 'La caja especificada no existe',
          error: 'Caja inválida'
        };
        return NextResponse.json(response, { status: 400 });
      }

      if (!cajaResult.rows[0].activo) {
        const response = {
          success: false,
          message: 'La caja especificada está inactiva',
          error: 'Caja inactiva'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que el usuario existe si se proporciona
    if (usuario_id) {
      const usuarioQuery = 'SELECT usuario_id FROM usuarios WHERE usuario_id = $1';
      const usuarioResult = await pool.query(usuarioQuery, [usuario_id]);
      
      if (usuarioResult.rows.length === 0) {
        const response = {
          success: false,
          message: 'El usuario especificado no existe',
          error: 'Usuario inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Actualizar cobro
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    if (monto !== undefined) {
      paramCount++;
      updateFields.push(`monto = $${paramCount}`);
      updateValues.push(monto);
    }

    if (caja_id !== undefined) {
      paramCount++;
      updateFields.push(`caja_id = $${paramCount}`);
      updateValues.push(caja_id);
    }

    if (observacion !== undefined) {
      paramCount++;
      updateFields.push(`observacion = $${paramCount}`);
      updateValues.push(observacion);
    }

    if (usuario_id !== undefined) {
      paramCount++;
      updateFields.push(`usuario_id = $${paramCount}`);
      updateValues.push(usuario_id);
    }

    if (updateFields.length === 0) {
      const response = {
        success: false,
        message: 'No hay campos para actualizar',
        error: 'Datos inválidos'
      };
      return NextResponse.json(response, { status: 400 });
    }

    paramCount++;
    updateValues.push(cobroId);

    const updateQuery = `
      UPDATE cobros 
      SET ${updateFields.join(', ')}
      WHERE cobro_id = $${paramCount}
      RETURNING cobro_id
    `;

    await pool.query(updateQuery, updateValues);

    // Obtener el cobro actualizado
    const getCobroQuery = `
      SELECT 
        c.cobro_id,
        c.venta_id,
        c.fecha_cobro,
        c.monto,
        c.usuario_id,
        c.caja_id,
        c.observacion,
        v.nro_factura,
        v.monto_venta as venta_total,
        v.fecha_venta,
        cl.nombre as cliente_nombre,
        cl.telefono as cliente_telefono,
        u.nombre as usuario_nombre,
        caja.nro_caja as caja_nro,
        s.nombre as sucursal_nombre,
        fc.nombre as forma_cobro_nombre,
        CONCAT('COB-', LPAD(c.cobro_id::text, 4, '0')) as codigo_cobro
      FROM cobros c
      LEFT JOIN ventas v ON c.venta_id = v.venta_id
      LEFT JOIN clientes cl ON v.cliente_id = cl.cliente_id
      LEFT JOIN usuarios u ON c.usuario_id = u.usuario_id
      LEFT JOIN cajas caja ON c.caja_id = caja.caja_id
      LEFT JOIN sucursales s ON caja.sucursal_id = s.sucursal_id
      LEFT JOIN formas_cobro fc ON v.forma_cobro_id = fc.forma_cobro_id
      WHERE c.cobro_id = $1
    `;

    const cobroData = await pool.query(getCobroQuery, [cobroId]);

    const response = {
      success: true,
      message: 'Cobro actualizado exitosamente',
      data: cobroData.rows[0]
    };

    // Log de auditoría
    console.log('Cobro actualizado:', sanitizeForLog({
      cobro_id: cobroId,
      campos_actualizados: updateFields,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al actualizar cobro:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/ventas/cobros/[id] - Eliminar cobro
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cobroId = parseInt(params.id);

    if (isNaN(cobroId)) {
      const response = {
        success: false,
        message: 'ID de cobro inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.eliminar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que el cobro existe
    const existingCobroQuery = 'SELECT cobro_id FROM cobros WHERE cobro_id = $1';
    const existingCobro = await pool.query(existingCobroQuery, [cobroId]);
    
    if (existingCobro.rows.length === 0) {
      const response = {
        success: false,
        message: 'Cobro no encontrado',
        error: 'Cobro no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Eliminar cobro
    await pool.query('DELETE FROM cobros WHERE cobro_id = $1', [cobroId]);

    const response = {
      success: true,
      message: 'Cobro eliminado exitosamente'
    };

    // Log de auditoría
    console.log('Cobro eliminado:', sanitizeForLog({
      cobro_id: cobroId,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al eliminar cobro:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
