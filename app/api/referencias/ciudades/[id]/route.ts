import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission } from '@/lib/middleware/auth'
import { UpdateCiudadRequest } from '@/lib/types/referencias'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const authResult = await requirePermission(request, 'referencias.leer')
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const ciudadId = parseInt(params.id)

    if (isNaN(ciudadId)) {
      return NextResponse.json(
        { error: 'ID de ciudad inválido' },
        { status: 400 }
      )
    }

    const query = `
      SELECT 
        id,
        nombre
      FROM ciudades
      WHERE id = $1
    `

    const result = await pool.query(query, [ciudadId])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Ciudad no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: result.rows[0] })

  } catch (error) {
    console.error('Error obteniendo ciudad:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const authResult = await requirePermission(request, 'referencias.actualizar')
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const ciudadId = parseInt(params.id)

    if (isNaN(ciudadId)) {
      return NextResponse.json(
        { error: 'ID de ciudad inválido' },
        { status: 400 }
      )
    }

    const body: UpdateCiudadRequest = await request.json()

    // Validar datos requeridos
    if (!body.nombre || body.nombre.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre de la ciudad es requerido' },
        { status: 400 }
      )
    }

    // Verificar si ya existe otra ciudad con el mismo nombre
    const existingQuery = `
      SELECT id FROM ciudades 
      WHERE LOWER(nombre) = LOWER($1) AND id != $2
    `
    const existingResult = await pool.query(existingQuery, [body.nombre.trim(), ciudadId])

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe otra ciudad con este nombre' },
        { status: 400 }
      )
    }

    // Actualizar ciudad
    const updateQuery = `
      UPDATE ciudades 
      SET 
        nombre = $1
      WHERE id = $2
      RETURNING id, nombre
    `

    const result = await pool.query(updateQuery, [body.nombre.trim(), ciudadId])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Ciudad no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Ciudad actualizada exitosamente',
      data: result.rows[0]
    })

  } catch (error) {
    console.error('Error actualizando ciudad:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos
    const authResult = await requirePermission(request, 'referencias.eliminar')
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const ciudadId = parseInt(params.id)

    if (isNaN(ciudadId)) {
      return NextResponse.json(
        { error: 'ID de ciudad inválido' },
        { status: 400 }
      )
    }

    // Verificar si la ciudad está siendo usada en otras tablas
    // (Por ejemplo, en clientes o proveedores)
    const checkUsageQuery = `
      SELECT 
        (SELECT COUNT(*) FROM clientes WHERE ciudad_id = $1) as clientes_count,
        (SELECT COUNT(*) FROM proveedores WHERE ciudad_id = $1) as proveedores_count
    `
    const usageResult = await pool.query(checkUsageQuery, [ciudadId])
    const { clientes_count, proveedores_count } = usageResult.rows[0]

    if (parseInt(clientes_count) > 0 || parseInt(proveedores_count) > 0) {
      return NextResponse.json(
        { 
          error: 'No se puede eliminar la ciudad porque está siendo utilizada por clientes o proveedores',
          details: {
            clientes: parseInt(clientes_count),
            proveedores: parseInt(proveedores_count)
          }
        },
        { status: 400 }
      )
    }

    // Verificar si existe
    const checkQuery = `
      SELECT id FROM ciudades WHERE id = $1
    `
    const checkResult = await pool.query(checkQuery, [ciudadId])

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Ciudad no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar ciudad
    const deleteQuery = `
      DELETE FROM ciudades WHERE id = $1
    `

    await pool.query(deleteQuery, [ciudadId])

    return NextResponse.json({
      message: 'Ciudad eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error eliminando ciudad:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
