import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission } from '@/lib/middleware/auth'

export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('referencias.leer')(request)
    if (!authorized) {
      return NextResponse.json({
        success: false,
        message: error || 'No autorizado',
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Construir consulta de búsqueda
    let whereClause = ''
    const queryParams: any[] = []
    
    if (search) {
      whereClause = 'WHERE e.numero_serie ILIKE $1 OR tt.nombre ILIKE $1'
      queryParams.push(`%${search}%`)
    }

    // Consulta principal
    const query = `
      SELECT 
        e.equipo_id,
        e.numero_serie,
        e.estado,
        tt.nombre as tipo_equipo,
        c.nombre as cliente_nombre,
        c.cliente_id
      FROM equipos e
      LEFT JOIN tipo_equipo tt ON e.tipo_equipo_id = tt.tipo_equipo_id
      LEFT JOIN recepcion_equipo_detalle red ON e.equipo_id = red.equipo_id
      LEFT JOIN recepcion_equipo re ON red.recepcion_id = re.recepcion_id
      LEFT JOIN solicitud_servicio ss ON re.solicitud_id = ss.solicitud_id
      LEFT JOIN clientes c ON ss.cliente_id = c.cliente_id
      ${whereClause}
      ORDER BY e.numero_serie ASC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `

    const allParams = [...queryParams, limit, offset]
    const result = await pool.query(query, allParams)
    const equipos = result.rows.map(equipo => ({
      equipo_id: Number(equipo.equipo_id),
      numero_serie: String(equipo.numero_serie || ''),
      estado: String(equipo.estado || ''),
      tipo_equipo: String(equipo.tipo_equipo || ''),
      cliente_nombre: String(equipo.cliente_nombre || ''),
      cliente_id: equipo.cliente_id ? Number(equipo.cliente_id) : null
    }))

    return NextResponse.json({
      success: true,
      message: 'Equipos obtenidos exitosamente',
      data: equipos
    })

  } catch (error) {
    console.error('Error al obtener equipos:', error)
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
