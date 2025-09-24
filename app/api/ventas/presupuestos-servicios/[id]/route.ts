import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { sanitizeForLog } from '@/lib/utils/ventas';

// GET /api/ventas/presupuestos-servicios/[id] - Obtener presupuesto específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const presupuestoId = parseInt(params.id);

    if (isNaN(presupuestoId)) {
      const response = {
        success: false,
        message: 'ID de presupuesto inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('leer_ventas')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Consulta principal
    const query = `
      SELECT 
        ps.presu_serv_id,
        ps.fecha_presupuesto,
        ps.estado,
        ps.monto_presu_ser,
        ps.observaciones,
        ps.descuento_id,
        ps.usuario_id,
        ps.sucursal_id,
        ps.promocion_id,
        ps.nro_presupuesto,
        ps.diagnostico_id,
        ps.valido_desde,
        ps.valido_hasta,
        ps.tipo_presu,
        u.nombre as usuario_nombre,
        s.nombre as sucursal_nombre,
        d.descripcion as diagnostico_descripcion,
        c.nombre as cliente_nombre,
        c.telefono as cliente_telefono,
        c.email as cliente_email,
        CONCAT('PRES-', LPAD(ps.presu_serv_id::text, 4, '0')) as codigo_presupuesto
      FROM presupuesto_servicios ps
      LEFT JOIN usuarios u ON ps.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON ps.sucursal_id = s.sucursal_id
      LEFT JOIN diagnosticos d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN clientes c ON d.cliente_id = c.cliente_id
      WHERE ps.presu_serv_id = $1
    `;

    const result = await pool.query(query, [presupuestoId]);
    
    if (result.rows.length === 0) {
      const response = {
        success: false,
        message: 'Presupuesto no encontrado',
        error: 'Presupuesto no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response = {
      success: true,
      message: 'Presupuesto obtenido exitosamente',
      data: result.rows[0]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener presupuesto:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/ventas/presupuestos-servicios/[id] - Actualizar presupuesto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const presupuestoId = parseInt(params.id);

    if (isNaN(presupuestoId)) {
      const response = {
        success: false,
        message: 'ID de presupuesto inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('actualizar_ventas')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body = await request.json();
    const { 
      estado, 
      monto_presu_ser, 
      observaciones, 
      descuento_id, 
      usuario_id, 
      sucursal_id, 
      promocion_id, 
      nro_presupuesto, 
      diagnostico_id, 
      valido_desde, 
      valido_hasta, 
      tipo_presu 
    } = body;

    // Verificar que el presupuesto existe
    const existingPresupuestoQuery = 'SELECT presu_serv_id FROM presupuesto_servicios WHERE presu_serv_id = $1';
    const existingPresupuesto = await pool.query(existingPresupuestoQuery, [presupuestoId]);
    
    if (existingPresupuesto.rows.length === 0) {
      const response = {
        success: false,
        message: 'Presupuesto no encontrado',
        error: 'Presupuesto no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
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

    // Verificar que la sucursal existe si se proporciona
    if (sucursal_id) {
      const sucursalQuery = 'SELECT sucursal_id FROM sucursales WHERE sucursal_id = $1';
      const sucursalResult = await pool.query(sucursalQuery, [sucursal_id]);
      
      if (sucursalResult.rows.length === 0) {
        const response = {
          success: false,
          message: 'La sucursal especificada no existe',
          error: 'Sucursal inválida'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que el diagnóstico existe si se proporciona
    if (diagnostico_id) {
      const diagnosticoQuery = 'SELECT diagnostico_id FROM diagnosticos WHERE diagnostico_id = $1';
      const diagnosticoResult = await pool.query(diagnosticoQuery, [diagnostico_id]);
      
      if (diagnosticoResult.rows.length === 0) {
        const response = {
          success: false,
          message: 'El diagnóstico especificado no existe',
          error: 'Diagnóstico inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Actualizar presupuesto
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    if (estado !== undefined) {
      paramCount++;
      updateFields.push(`estado = $${paramCount}`);
      updateValues.push(estado);
    }

    if (monto_presu_ser !== undefined) {
      paramCount++;
      updateFields.push(`monto_presu_ser = $${paramCount}`);
      updateValues.push(monto_presu_ser);
    }

    if (observaciones !== undefined) {
      paramCount++;
      updateFields.push(`observaciones = $${paramCount}`);
      updateValues.push(observaciones);
    }

    if (descuento_id !== undefined) {
      paramCount++;
      updateFields.push(`descuento_id = $${paramCount}`);
      updateValues.push(descuento_id);
    }

    if (usuario_id !== undefined) {
      paramCount++;
      updateFields.push(`usuario_id = $${paramCount}`);
      updateValues.push(usuario_id);
    }

    if (sucursal_id !== undefined) {
      paramCount++;
      updateFields.push(`sucursal_id = $${paramCount}`);
      updateValues.push(sucursal_id);
    }

    if (promocion_id !== undefined) {
      paramCount++;
      updateFields.push(`promocion_id = $${paramCount}`);
      updateValues.push(promocion_id);
    }

    if (nro_presupuesto !== undefined) {
      paramCount++;
      updateFields.push(`nro_presupuesto = $${paramCount}`);
      updateValues.push(nro_presupuesto);
    }

    if (diagnostico_id !== undefined) {
      paramCount++;
      updateFields.push(`diagnostico_id = $${paramCount}`);
      updateValues.push(diagnostico_id);
    }

    if (valido_desde !== undefined) {
      paramCount++;
      updateFields.push(`valido_desde = $${paramCount}`);
      updateValues.push(valido_desde);
    }

    if (valido_hasta !== undefined) {
      paramCount++;
      updateFields.push(`valido_hasta = $${paramCount}`);
      updateValues.push(valido_hasta);
    }

    if (tipo_presu !== undefined) {
      paramCount++;
      updateFields.push(`tipo_presu = $${paramCount}`);
      updateValues.push(tipo_presu);
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
    updateValues.push(presupuestoId);

    const updateQuery = `
      UPDATE presupuesto_servicios 
      SET ${updateFields.join(', ')}
      WHERE presu_serv_id = $${paramCount}
      RETURNING presu_serv_id
    `;

    await pool.query(updateQuery, updateValues);

    // Obtener el presupuesto actualizado
    const getPresupuestoQuery = `
      SELECT 
        ps.presu_serv_id,
        ps.fecha_presupuesto,
        ps.estado,
        ps.monto_presu_ser,
        ps.observaciones,
        ps.descuento_id,
        ps.usuario_id,
        ps.sucursal_id,
        ps.promocion_id,
        ps.nro_presupuesto,
        ps.diagnostico_id,
        ps.valido_desde,
        ps.valido_hasta,
        ps.tipo_presu,
        u.nombre as usuario_nombre,
        s.nombre as sucursal_nombre,
        d.descripcion as diagnostico_descripcion,
        c.nombre as cliente_nombre,
        c.telefono as cliente_telefono,
        c.email as cliente_email,
        CONCAT('PRES-', LPAD(ps.presu_serv_id::text, 4, '0')) as codigo_presupuesto
      FROM presupuesto_servicios ps
      LEFT JOIN usuarios u ON ps.usuario_id = u.usuario_id
      LEFT JOIN sucursales s ON ps.sucursal_id = s.sucursal_id
      LEFT JOIN diagnosticos d ON ps.diagnostico_id = d.diagnostico_id
      LEFT JOIN clientes c ON d.cliente_id = c.cliente_id
      WHERE ps.presu_serv_id = $1
    `;

    const presupuestoData = await pool.query(getPresupuestoQuery, [presupuestoId]);

    const response = {
      success: true,
      message: 'Presupuesto actualizado exitosamente',
      data: presupuestoData.rows[0]
    };

    // Log de auditoría
    console.log('Presupuesto actualizado:', sanitizeForLog({
      presu_serv_id: presupuestoId,
      campos_actualizados: updateFields,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al actualizar presupuesto:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/ventas/presupuestos-servicios/[id] - Eliminar presupuesto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const presupuestoId = parseInt(params.id);

    if (isNaN(presupuestoId)) {
      const response = {
        success: false,
        message: 'ID de presupuesto inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('eliminar_ventas')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que el presupuesto existe
    const existingPresupuestoQuery = 'SELECT presu_serv_id FROM presupuesto_servicios WHERE presu_serv_id = $1';
    const existingPresupuesto = await pool.query(existingPresupuestoQuery, [presupuestoId]);
    
    if (existingPresupuesto.rows.length === 0) {
      const response = {
        success: false,
        message: 'Presupuesto no encontrado',
        error: 'Presupuesto no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Eliminar presupuesto
    await pool.query('DELETE FROM presupuesto_servicios WHERE presu_serv_id = $1', [presupuestoId]);

    const response = {
      success: true,
      message: 'Presupuesto eliminado exitosamente'
    };

    // Log de auditoría
    console.log('Presupuesto eliminado:', sanitizeForLog({
      presu_serv_id: presupuestoId,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al eliminar presupuesto:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
