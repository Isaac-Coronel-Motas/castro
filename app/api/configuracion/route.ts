import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

interface Configuracion {
  config_id: number
  clave: string
  valor: string
  descripcion?: string
  tipo: 'string' | 'number' | 'boolean' | 'json'
  categoria: string
  activo: boolean
  created_at: string
  updated_at?: string
}

// GET /api/configuracion - Obtener todas las configuraciones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoria = searchParams.get('categoria')
    const activo = searchParams.get('activo')

    let query = `
      SELECT config_id, clave, valor, descripcion, tipo, categoria, activo, created_at, updated_at
      FROM configuracion
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (categoria) {
      query += ` AND categoria = $${paramIndex}`
      params.push(categoria)
      paramIndex++
    }

    if (activo !== null) {
      query += ` AND activo = $${paramIndex}`
      params.push(activo === 'true')
      paramIndex++
    }

    query += ` ORDER BY categoria, clave`

    const result = await pool.query(query, params)
    
    // Convertir valores según su tipo
    const configuraciones = result.rows.map((row: any) => {
      let valor = row.valor
      
      switch (row.tipo) {
        case 'number':
          valor = parseFloat(row.valor)
          break
        case 'boolean':
          valor = row.valor === 'true'
          break
        case 'json':
          try {
            valor = JSON.parse(row.valor)
          } catch {
            valor = row.valor
          }
          break
        default:
          valor = row.valor
      }

      return {
        ...row,
        valor
      }
    })

    return NextResponse.json({
      success: true,
      data: configuraciones,
      message: 'Configuraciones obtenidas exitosamente'
    })

  } catch (error) {
    console.error('Error al obtener configuraciones:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/configuracion - Crear nueva configuración
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clave, valor, descripcion, tipo, categoria, activo = true } = body

    // Validaciones
    if (!clave || !valor || !tipo || !categoria) {
      return NextResponse.json(
        { success: false, message: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Verificar que la clave no exista
    const existingConfig = await pool.query(
      'SELECT config_id FROM configuracion WHERE clave = $1',
      [clave]
    )

    if (existingConfig.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Ya existe una configuración con esta clave' },
        { status: 400 }
      )
    }

    // Convertir valor según el tipo
    let valorString = valor
    if (tipo === 'json') {
      valorString = JSON.stringify(valor)
    } else if (tipo === 'boolean') {
      valorString = valor.toString()
    } else if (tipo === 'number') {
      valorString = valor.toString()
    }

    const result = await pool.query(
      `INSERT INTO configuracion (clave, valor, descripcion, tipo, categoria, activo, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING config_id, clave, valor, descripcion, tipo, categoria, activo, created_at`,
      [clave, valorString, descripcion, tipo, categoria, activo]
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Configuración creada exitosamente'
    })

  } catch (error) {
    console.error('Error al crear configuración:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/configuracion - Actualizar configuración existente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { config_id, clave, valor, descripcion, tipo, categoria, activo } = body

    if (!config_id) {
      return NextResponse.json(
        { success: false, message: 'ID de configuración requerido' },
        { status: 400 }
      )
    }

    // Convertir valor según el tipo
    let valorString = valor
    if (tipo === 'json') {
      valorString = JSON.stringify(valor)
    } else if (tipo === 'boolean') {
      valorString = valor.toString()
    } else if (tipo === 'number') {
      valorString = valor.toString()
    }

    const result = await pool.query(
      `UPDATE configuracion 
       SET clave = $1, valor = $2, descripcion = $3, tipo = $4, categoria = $5, activo = $6, updated_at = NOW()
       WHERE config_id = $7
       RETURNING config_id, clave, valor, descripcion, tipo, categoria, activo, created_at, updated_at`,
      [clave, valorString, descripcion, tipo, categoria, activo, config_id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Configuración no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Configuración actualizada exitosamente'
    })

  } catch (error) {
    console.error('Error al actualizar configuración:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/configuracion - Eliminar configuración
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const config_id = searchParams.get('config_id')

    if (!config_id) {
      return NextResponse.json(
        { success: false, message: 'ID de configuración requerido' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      'DELETE FROM configuracion WHERE config_id = $1 RETURNING config_id',
      [config_id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Configuración no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error al eliminar configuración:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
