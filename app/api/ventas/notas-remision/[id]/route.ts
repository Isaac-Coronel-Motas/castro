import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { sanitizeForLog } from '@/lib/utils/ventas';

// GET /api/ventas/notas-remision/[id] - Obtener nota de remisión específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const remisionId = parseInt(params.id);

    if (isNaN(remisionId)) {
      const response = {
        success: false,
        message: 'ID de nota de remisión inválido',
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
        nr.remision_id,
        nr.fecha_remision,
        nr.usuario_id,
        nr.origen_almacen_id,
        nr.destino_sucursal_id,
        nr.destino_almacen_id,
        nr.tipo_remision,
        nr.referencia_id,
        nr.estado,
        nr.observaciones,
        u.nombre as usuario_nombre,
        oa.nombre as origen_almacen_nombre,
        ds.nombre as destino_sucursal_nombre,
        da.nombre as destino_almacen_nombre,
        CONCAT('REM-', LPAD(nr.remision_id::text, 4, '0')) as codigo_remision,
        COALESCE(detalle_stats.total_productos, 0) as total_productos,
        COALESCE(detalle_stats.total_cantidad, 0) as total_cantidad
      FROM nota_remision nr
      LEFT JOIN usuarios u ON nr.usuario_id = u.usuario_id
      LEFT JOIN almacenes oa ON nr.origen_almacen_id = oa.almacen_id
      LEFT JOIN sucursales ds ON nr.destino_sucursal_id = ds.sucursal_id
      LEFT JOIN almacenes da ON nr.destino_almacen_id = da.almacen_id
      LEFT JOIN (
        SELECT 
          remision_id,
          COUNT(*) as total_productos,
          SUM(cantidad) as total_cantidad
        FROM nota_remision_detalle
        GROUP BY remision_id
      ) detalle_stats ON nr.remision_id = detalle_stats.remision_id
      WHERE nr.remision_id = $1
    `;

    const result = await pool.query(query, [remisionId]);
    
    if (result.rows.length === 0) {
      const response = {
        success: false,
        message: 'Nota de remisión no encontrada',
        error: 'Nota de remisión no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response = {
      success: true,
      message: 'Nota de remisión obtenida exitosamente',
      data: result.rows[0]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener nota de remisión:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/ventas/notas-remision/[id] - Actualizar nota de remisión
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const remisionId = parseInt(params.id);

    if (isNaN(remisionId)) {
      const response = {
        success: false,
        message: 'ID de nota de remisión inválido',
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
      fecha_remision, 
      usuario_id, 
      origen_almacen_id, 
      destino_sucursal_id, 
      destino_almacen_id, 
      tipo_remision, 
      referencia_id, 
      estado,
      observaciones,
      detalles = []
    } = body;

    // Verificar que la nota de remisión existe
    const existingNotaQuery = 'SELECT remision_id FROM nota_remision WHERE remision_id = $1';
    const existingNota = await pool.query(existingNotaQuery, [remisionId]);
    
    if (existingNota.rows.length === 0) {
      const response = {
        success: false,
        message: 'Nota de remisión no encontrada',
        error: 'Nota de remisión no encontrada'
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

    // Verificar que el almacén de origen existe si se proporciona
    if (origen_almacen_id) {
      const origenQuery = 'SELECT almacen_id FROM almacenes WHERE almacen_id = $1';
      const origenResult = await pool.query(origenQuery, [origen_almacen_id]);
      
      if (origenResult.rows.length === 0) {
        const response = {
          success: false,
          message: 'El almacén de origen especificado no existe',
          error: 'Almacén inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar destino según el tipo
    if (destino_sucursal_id) {
      const destinoQuery = 'SELECT sucursal_id FROM sucursales WHERE sucursal_id = $1';
      const destinoResult = await pool.query(destinoQuery, [destino_sucursal_id]);
      
      if (destinoResult.rows.length === 0) {
        const response = {
          success: false,
          message: 'La sucursal de destino especificada no existe',
          error: 'Sucursal inválida'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    if (destino_almacen_id) {
      const destinoQuery = 'SELECT almacen_id FROM almacenes WHERE almacen_id = $1';
      const destinoResult = await pool.query(destinoQuery, [destino_almacen_id]);
      
      if (destinoResult.rows.length === 0) {
        const response = {
          success: false,
          message: 'El almacén de destino especificado no existe',
          error: 'Almacén inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Iniciar transacción
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Actualizar nota de remisión
      const updateFields = [];
      const updateValues = [];
      let paramCount = 0;

      if (fecha_remision !== undefined) {
        paramCount++;
        updateFields.push(`fecha_remision = $${paramCount}`);
        updateValues.push(fecha_remision);
      }

      if (usuario_id !== undefined) {
        paramCount++;
        updateFields.push(`usuario_id = $${paramCount}`);
        updateValues.push(usuario_id);
      }

      if (origen_almacen_id !== undefined) {
        paramCount++;
        updateFields.push(`origen_almacen_id = $${paramCount}`);
        updateValues.push(origen_almacen_id);
      }

      if (destino_sucursal_id !== undefined) {
        paramCount++;
        updateFields.push(`destino_sucursal_id = $${paramCount}`);
        updateValues.push(destino_sucursal_id);
      }

      if (destino_almacen_id !== undefined) {
        paramCount++;
        updateFields.push(`destino_almacen_id = $${paramCount}`);
        updateValues.push(destino_almacen_id);
      }

      if (tipo_remision !== undefined) {
        paramCount++;
        updateFields.push(`tipo_remision = $${paramCount}`);
        updateValues.push(tipo_remision);
      }

      if (referencia_id !== undefined) {
        paramCount++;
        updateFields.push(`referencia_id = $${paramCount}`);
        updateValues.push(referencia_id);
      }

      if (estado !== undefined) {
        paramCount++;
        updateFields.push(`estado = $${paramCount}`);
        updateValues.push(estado);
      }

      if (observaciones !== undefined) {
        paramCount++;
        updateFields.push(`observaciones = $${paramCount}`);
        updateValues.push(observaciones);
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
      updateValues.push(remisionId);

      const updateQuery = `
        UPDATE nota_remision 
        SET ${updateFields.join(', ')}
        WHERE remision_id = $${paramCount}
        RETURNING remision_id
      `;

      await client.query(updateQuery, updateValues);

      // Actualizar detalles si se proporcionan
      if (detalles && detalles.length > 0) {
        // Eliminar detalles existentes
        await client.query('DELETE FROM nota_remision_detalle WHERE remision_id = $1', [remisionId]);

        // Crear nuevos detalles
        for (const detalle of detalles) {
          // Verificar que el producto existe
          const productoQuery = 'SELECT producto_id FROM productos WHERE producto_id = $1';
          const productoResult = await client.query(productoQuery, [detalle.producto_id]);
          
          if (productoResult.rows.length === 0) {
            throw new Error(`El producto con ID ${detalle.producto_id} no existe`);
          }

          // Crear detalle
          const createDetalleQuery = `
            INSERT INTO nota_remision_detalle (remision_id, producto_id, cantidad)
            VALUES ($1, $2, $3)
          `;
          
          await client.query(createDetalleQuery, [
            remisionId,
            detalle.producto_id,
            detalle.cantidad
          ]);
        }
      }

      await client.query('COMMIT');

      // Obtener la nota actualizada
      const getNotaQuery = `
        SELECT 
          nr.remision_id,
          nr.fecha_remision,
          nr.usuario_id,
          nr.origen_almacen_id,
          nr.destino_sucursal_id,
          nr.destino_almacen_id,
          nr.tipo_remision,
          nr.referencia_id,
          nr.estado,
          nr.observaciones,
          u.nombre as usuario_nombre,
          oa.nombre as origen_almacen_nombre,
          ds.nombre as destino_sucursal_nombre,
          da.nombre as destino_almacen_nombre,
          CONCAT('REM-', LPAD(nr.remision_id::text, 4, '0')) as codigo_remision,
          COALESCE(detalle_stats.total_productos, 0) as total_productos,
          COALESCE(detalle_stats.total_cantidad, 0) as total_cantidad
        FROM nota_remision nr
        LEFT JOIN usuarios u ON nr.usuario_id = u.usuario_id
        LEFT JOIN almacenes oa ON nr.origen_almacen_id = oa.almacen_id
        LEFT JOIN sucursales ds ON nr.destino_sucursal_id = ds.sucursal_id
        LEFT JOIN almacenes da ON nr.destino_almacen_id = da.almacen_id
        LEFT JOIN (
          SELECT 
            remision_id,
            COUNT(*) as total_productos,
            SUM(cantidad) as total_cantidad
          FROM nota_remision_detalle
          GROUP BY remision_id
        ) detalle_stats ON nr.remision_id = detalle_stats.remision_id
        WHERE nr.remision_id = $1
      `;

      const notaData = await pool.query(getNotaQuery, [remisionId]);

      const response = {
        success: true,
        message: 'Nota de remisión actualizada exitosamente',
        data: notaData.rows[0]
      };

      // Log de auditoría
      console.log('Nota de remisión actualizada:', sanitizeForLog({
        remision_id: remisionId,
        campos_actualizados: updateFields,
        total_detalles: detalles.length,
        timestamp: new Date().toISOString()
      }));

      return NextResponse.json(response);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error al actualizar nota de remisión:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/ventas/notas-remision/[id] - Eliminar nota de remisión
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const remisionId = parseInt(params.id);

    if (isNaN(remisionId)) {
      const response = {
        success: false,
        message: 'ID de nota de remisión inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('eliminar_ventas')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que la nota de remisión existe
    const existingNotaQuery = 'SELECT remision_id FROM nota_remision WHERE remision_id = $1';
    const existingNota = await pool.query(existingNotaQuery, [remisionId]);
    
    if (existingNota.rows.length === 0) {
      const response = {
        success: false,
        message: 'Nota de remisión no encontrada',
        error: 'Nota de remisión no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Iniciar transacción
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Eliminar detalles primero
      await client.query('DELETE FROM nota_remision_detalle WHERE remision_id = $1', [remisionId]);

      // Eliminar nota de remisión
      await client.query('DELETE FROM nota_remision WHERE remision_id = $1', [remisionId]);

      await client.query('COMMIT');

      const response = {
        success: true,
        message: 'Nota de remisión eliminada exitosamente'
      };

      // Log de auditoría
      console.log('Nota de remisión eliminada:', sanitizeForLog({
        remision_id: remisionId,
        timestamp: new Date().toISOString()
      }));

      return NextResponse.json(response);

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error al eliminar nota de remisión:', error);
    
    const response = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}