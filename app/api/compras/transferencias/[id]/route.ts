import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission } from '@/lib/middleware/auth'
import { 
  validateTransferenciaStockData, 
  generateTransferCode,
  canCompleteTransfer,
  sanitizeForLogServer 
} from '@/lib/utils/compras-adicionales'
import { 
  UpdateTransferenciaStockRequest, 
  ComprasAdicionalesApiResponse 
} from '@/lib/types/compras-adicionales'

// GET - Obtener transferencia por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transferenciaId = parseInt(params.id)
    
    if (isNaN(transferenciaId)) {
      return NextResponse.json({
        success: false,
        message: 'ID de transferencia inválido'
      }, { status: 400 })
    }

    const query = `
      SELECT 
        ts.transferencia_id,
        ts.fecha,
        ts.usuario_id,
        ts.almacen_origen_id,
        ts.almacen_destino_id,
        ts.estado,
        ts.motivo,
        ts.codigo_transferencia,
        u.nombre as usuario_nombre,
        ao.nombre as almacen_origen_nombre,
        ad.nombre as almacen_destino_nombre,
        COUNT(tsd.transferencia_detalle_id) as total_productos,
        COALESCE(SUM(tsd.cantidad * p.precio_venta), 0) as valor_total
      FROM transferencia_stock ts
      LEFT JOIN usuarios u ON ts.usuario_id = u.usuario_id
      LEFT JOIN almacenes ao ON ts.almacen_origen_id = ao.almacen_id
      LEFT JOIN almacenes ad ON ts.almacen_destino_id = ad.almacen_id
      LEFT JOIN transferencia_stock_detalle tsd ON ts.transferencia_id = tsd.transferencia_id
      LEFT JOIN productos p ON tsd.producto_id = p.producto_id
      WHERE ts.transferencia_id = $1
      GROUP BY ts.transferencia_id, ts.fecha, ts.usuario_id, ts.almacen_origen_id, 
               ts.almacen_destino_id, ts.estado, ts.motivo, ts.codigo_transferencia,
               u.nombre, ao.nombre, ad.nombre
    `

    const result = await pool.query(query, [transferenciaId])

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Transferencia no encontrada'
      }, { status: 404 })
    }

    const transferencia = result.rows[0]

    // Obtener detalles de la transferencia
    const detallesQuery = `
      SELECT 
        tsd.transferencia_detalle_id,
        tsd.transferencia_id,
        tsd.producto_id,
        tsd.cantidad,
        tsd.observaciones,
        p.cod_product,
        p.nombre_producto,
        p.precio_venta
      FROM transferencia_stock_detalle tsd
      LEFT JOIN productos p ON tsd.producto_id = p.producto_id
      WHERE tsd.transferencia_id = $1
      ORDER BY tsd.transferencia_detalle_id
    `

    const detallesResult = await pool.query(detallesQuery, [transferenciaId])
    transferencia.detalles = detallesResult.rows

    return NextResponse.json({
      success: true,
      data: transferencia
    })

  } catch (error) {
    console.error('Error obteniendo transferencia:', error)
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// PUT - Actualizar transferencia
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transferenciaId = parseInt(params.id)
    
    if (isNaN(transferenciaId)) {
      return NextResponse.json({
        success: false,
        message: 'ID de transferencia inválido'
      }, { status: 400 })
    }

    const body: UpdateTransferenciaStockRequest = await request.json()
    const validation = validateTransferenciaStockData(body)

    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        message: 'Datos de transferencia inválidos',
        errors: validation.errors
      }, { status: 400 })
    }

    // Verificar que la transferencia existe
    const checkQuery = 'SELECT transferencia_id, estado FROM transferencia_stock WHERE transferencia_id = $1'
    const checkResult = await pool.query(checkQuery, [transferenciaId])

    if (checkResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Transferencia no encontrada'
      }, { status: 404 })
    }

    const existingTransferencia = checkResult.rows[0]

    // Verificar si se puede modificar
    if (existingTransferencia.estado === 'completada') {
      return NextResponse.json({
        success: false,
        message: 'No se puede modificar una transferencia completada'
      }, { status: 400 })
    }

    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // Actualizar cabecera
      const updateQuery = `
        UPDATE transferencia_stock 
        SET 
          usuario_id = $2,
          almacen_origen_id = $3,
          almacen_destino_id = $4,
          fecha = COALESCE($5, fecha),
          estado = COALESCE($6, estado),
          motivo = $7
        WHERE transferencia_id = $1
        RETURNING *
      `

      const updateResult = await client.query(updateQuery, [
        transferenciaId,
        body.usuario_id,
        body.almacen_origen_id,
        body.almacen_destino_id,
        body.fecha,
        body.estado,
        body.motivo
      ])

      // Eliminar detalles existentes
      await client.query('DELETE FROM transferencia_stock_detalle WHERE transferencia_id = $1', [transferenciaId])

      // Insertar nuevos detalles
      if (body.items && body.items.length > 0) {
        for (const item of body.items) {
          await client.query(`
            INSERT INTO transferencia_stock_detalle (
              transferencia_id, producto_id, cantidad, observaciones
            ) VALUES ($1, $2, $3, $4)
          `, [
            transferenciaId,
            item.producto_id,
            item.cantidad,
            item.observaciones || null
          ])
        }
      }

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        message: 'Transferencia actualizada exitosamente',
        data: updateResult.rows[0]
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Error actualizando transferencia:', error)
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 })
  }
}

// DELETE - Eliminar transferencia
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transferenciaId = parseInt(params.id)
    
    if (isNaN(transferenciaId)) {
      return NextResponse.json({
        success: false,
        message: 'ID de transferencia inválido'
      }, { status: 400 })
    }

    // Verificar que la transferencia existe
    const checkQuery = 'SELECT transferencia_id, estado FROM transferencia_stock WHERE transferencia_id = $1'
    const checkResult = await pool.query(checkQuery, [transferenciaId])

    if (checkResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Transferencia no encontrada'
      }, { status: 404 })
    }

    const existingTransferencia = checkResult.rows[0]

    // Verificar si se puede eliminar
    if (existingTransferencia.estado === 'completada') {
      return NextResponse.json({
        success: false,
        message: 'No se puede eliminar una transferencia completada'
      }, { status: 400 })
    }

    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // Eliminar detalles primero
      await client.query('DELETE FROM transferencia_stock_detalle WHERE transferencia_id = $1', [transferenciaId])

      // Eliminar cabecera
      await client.query('DELETE FROM transferencia_stock WHERE transferencia_id = $1', [transferenciaId])

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        message: 'Transferencia eliminada exitosamente'
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Error eliminando transferencia:', error)
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 })
  }
}
