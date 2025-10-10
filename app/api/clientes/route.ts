import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission } from '@/lib/middleware/auth'

export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.leer')(request);
    
    if (!authorized) {
      return NextResponse.json({ success: false, message: error || 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const limit = searchParams.get('limit') || '50'
    const offset = searchParams.get('offset') || '0'

    // Construir cláusula WHERE
    const whereConditions = []
    const queryParams = []

    if (search) {
      whereConditions.push(`(c.nombre ILIKE $${queryParams.length + 1} OR c.email ILIKE $${queryParams.length + 1})`)
      queryParams.push(`%${search}%`)
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // Query para obtener clientes
    const query = `
      SELECT 
        c.cliente_id,
        c.nombre,
        c.email,
        c.telefono,
        c.direccion,
        c.estado
      FROM clientes c
      ${whereClause}
      ORDER BY c.nombre
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `

    queryParams.push(limit, offset)

    const result = await pool.query(query, queryParams)

    // Query para contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM clientes c
      ${whereClause}
    `

    const countResult = await pool.query(countQuery, queryParams.slice(0, -2))
    const total = parseInt(countResult.rows[0].total)

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total
      }
    })

  } catch (error) {
    console.error('Error obteniendo clientes:', error)
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
