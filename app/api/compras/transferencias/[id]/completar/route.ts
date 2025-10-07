import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission } from '@/lib/middleware/auth'
import { canCompleteTransfer, sanitizeForLogServer } from '@/lib/utils/compras-adicionales'

// PUT - Completar transferencia
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

    // Verificar que la transferencia existe
    const checkQuery = `
      SELECT 
        ts.transferencia_id,
        ts.estado,
        ts.almacen_origen_id,
        ts.almacen_destino_id,
        COUNT(tsd.transferencia_detalle_id) as total_detalles
      FROM transferencia_stock ts
      LEFT JOIN transferencia_stock_detalle tsd ON ts.transferencia_id = tsd.transferencia_id
      WHERE ts.transferencia_id = $1
      GROUP BY ts.transferencia_id, ts.estado, ts.almacen_origen_id, ts.almacen_destino_id
    `
    
    const checkResult = await pool.query(checkQuery, [transferenciaId])

    if (checkResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Transferencia no encontrada'
      }, { status: 404 })
    }

    const transferencia = checkResult.rows[0]

    // Verificar si se puede completar
    if (!canCompleteTransfer(transferencia.estado)) {
      return NextResponse.json({
        success: false,
        message: `No se puede completar una transferencia en estado '${transferencia.estado}'`
      }, { status: 400 })
    }

    if (transferencia.total_detalles === 0) {
      return NextResponse.json({
        success: false,
        message: 'No se puede completar una transferencia sin productos'
      }, { status: 400 })
    }

    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // Obtener detalles de la transferencia
      const detallesQuery = `
        SELECT 
          tsd.producto_id,
          tsd.cantidad,
          p.stock as stock_actual
        FROM transferencia_stock_detalle tsd
        LEFT JOIN productos p ON tsd.producto_id = p.producto_id
        WHERE tsd.transferencia_id = $1
      `
      
      const detallesResult = await client.query(detallesQuery, [transferenciaId])
      const detalles = detallesResult.rows

      // Verificar stock disponible en almacén origen
      for (const detalle of detalles) {
        if (detalle.stock_actual < detalle.cantidad) {
          await client.query('ROLLBACK')
          return NextResponse.json({
            success: false,
            message: `Stock insuficiente para el producto ${detalle.producto_id}. Disponible: ${detalle.stock_actual}, Requerido: ${detalle.cantidad}`
          }, { status: 400 })
        }
      }

      // Actualizar stock: reducir en almacén origen y aumentar en almacén destino
      for (const detalle of detalles) {
        // Reducir stock en almacén origen
        await client.query(`
          UPDATE productos 
          SET stock = stock - $2 
          WHERE producto_id = $1
        `, [detalle.producto_id, detalle.cantidad])

        // Nota: En una implementación real con stock por almacén, aquí se harían dos operaciones:
        // 1. Reducir stock en almacén origen
        // 2. Aumentar stock en almacén destino
        // Por ahora solo reducimos el stock general del producto
      }

      // Actualizar estado de la transferencia
      await client.query(`
        UPDATE transferencia_stock 
        SET estado = 'completada'
        WHERE transferencia_id = $1
      `, [transferenciaId])

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        message: 'Transferencia completada exitosamente'
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('Error completando transferencia:', error)
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 })
  }
}
