import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission } from '@/lib/middleware/auth'
import { CreateDepartamentoRequest, UpdateDepartamentoRequest } from '@/lib/types/referencias'

export async function GET(request: NextRequest) {
  console.log('🚀 GET departamentos iniciado')
  
  try {
    console.log('🔐 Verificando permisos...')
    // Verificar permisos
    const authResult = requirePermission('referencias.leer')(request)
    console.log('🔐 Resultado de permisos:', authResult)
    
    if (!authResult.authorized) {
      console.log('❌ Permisos denegados:', authResult.error)
      return NextResponse.json({ error: authResult.error }, { status: 403 })
    }

    console.log('✅ Permisos verificados, ejecutando consulta...')
    
    // Consulta simple sin ordenamiento complejo
    const query = `
      SELECT 
        departamento_id,
        nombre_departamento
      FROM departamentos
      ORDER BY departamento_id ASC
    `

    console.log('🔍 Query departamentos:', query)
    const result = await pool.query(query)
    console.log('📊 Resultado departamentos:', result.rows)

    const response = {
      success: true,
      data: result.rows,
      pagination: {
        page: 1,
        limit: result.rows.length,
        total: result.rows.length,
        totalPages: 1
      }
    }
    
    console.log('📤 Respuesta departamentos:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Error obteniendo departamentos:', error)
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace available')
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const authResult = requirePermission('referencias.crear')(request)
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 403 })
    }

    const body: CreateDepartamentoRequest = await request.json()

    // Validar datos requeridos
    if (!body.nombre_departamento || body.nombre_departamento.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre del departamento es requerido' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un departamento con el mismo nombre
    const existingQuery = `
      SELECT departamento_id FROM departamentos 
      WHERE LOWER(nombre_departamento) = LOWER($1)
    `
    const existingResult = await pool.query(existingQuery, [body.nombre_departamento.trim()])

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Ya existe un departamento con este nombre' },
        { status: 400 }
      )
    }

    // Insertar nuevo departamento
    const insertQuery = `
      INSERT INTO departamentos (nombre_departamento)
      VALUES ($1)
      RETURNING departamento_id, nombre_departamento
    `

    const result = await pool.query(insertQuery, [body.nombre_departamento.trim()])

    return NextResponse.json({
      message: 'Departamento creado exitosamente',
      data: result.rows[0]
    }, { status: 201 })

  } catch (error) {
    console.error('Error creando departamento:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
