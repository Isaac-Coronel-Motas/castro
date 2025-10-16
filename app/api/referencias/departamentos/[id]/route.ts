import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission } from '@/lib/middleware/auth'
import { UpdateDepartamentoRequest } from '@/lib/types/referencias'

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

    const departamentoId = parseInt(params.id)

    if (isNaN(departamentoId)) {
      return NextResponse.json(
        { error: 'ID de departamento inválido' },
        { status: 400 }
      )
    }

    const query = `
      SELECT 
        departamento_id,
        nombre_departamento
      FROM departamentos
      WHERE departamento_id = $1
    `

    const result = await pool.query(query, [departamentoId])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Departamento no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: result.rows[0] })

  } catch (error) {
    console.error('Error obteniendo departamento:', error)
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

    const departamentoId = parseInt(params.id)

    if (isNaN(departamentoId)) {
      return NextResponse.json(
        { error: 'ID de departamento inválido' },
        { status: 400 }
      )
    }

    const body: UpdateDepartamentoRequest = await request.json()

    // Validar datos requeridos
    if (!body.nombre_departamento || body.nombre_departamento.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre del departamento es requerido' },
        { status: 400 }
      )
    }

    // Verificar si ya existe otro departamento con el mismo nombre
    const existingQuery = `
      SELECT departamento_id FROM departamentos 
      WHERE LOWER(nombre_departamento) = LOWER($1) AND departamento_id != $2
    `
    const existingResult = await pool.query(existingQuery, [body.nombre_departamento.trim(), departamentoId])

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe otro departamento con este nombre' },
        { status: 400 }
      )
    }

    // Actualizar departamento
    const updateQuery = `
      UPDATE departamentos 
      SET 
        nombre_departamento = $1
      WHERE departamento_id = $2
      RETURNING departamento_id, nombre_departamento
    `

    const result = await pool.query(updateQuery, [body.nombre_departamento.trim(), departamentoId])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Departamento no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Departamento actualizado exitosamente',
      data: result.rows[0]
    })

  } catch (error) {
    console.error('Error actualizando departamento:', error)
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

    const departamentoId = parseInt(params.id)

    if (isNaN(departamentoId)) {
      return NextResponse.json(
        { error: 'ID de departamento inválido' },
        { status: 400 }
      )
    }

    // Verificar si el departamento está siendo usado en otras tablas
    // (Por ejemplo, en clientes o proveedores si tienen referencia a departamento)
    // Por ahora solo verificamos si existe
    const checkQuery = `
      SELECT departamento_id FROM departamentos WHERE departamento_id = $1
    `
    const checkResult = await pool.query(checkQuery, [departamentoId])

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Departamento no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar departamento
    const deleteQuery = `
      DELETE FROM departamentos WHERE departamento_id = $1
    `

    await pool.query(deleteQuery, [departamentoId])

    return NextResponse.json({
      message: 'Departamento eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error eliminando departamento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
