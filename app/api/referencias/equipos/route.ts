import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { requirePermission, createAuthzErrorResponse } from '@/lib/middleware/auth';

// GET - Listar equipos
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('servicios.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const query = `
      SELECT 
        e.equipo_id,
        e.numero_serie,
        e.estado,
        te.tipo_equipo_id,
        te.nombre as tipo_equipo_nombre,
        te.descripcion
      FROM equipos e
      INNER JOIN tipo_equipo te ON e.tipo_equipo_id = te.tipo_equipo_id
      ORDER BY e.equipo_id DESC
    `;

    const result = await pool.query(query);
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error obteniendo equipos:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// POST - Crear nuevo equipo
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('servicios.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body = await request.json();
    const { tipo_equipo_id, numero_serie, estado } = body;

    // Validaciones
    if (!tipo_equipo_id) {
      return NextResponse.json({
        success: false,
        message: 'El tipo de equipo es requerido'
      }, { status: 400 });
    }

    if (!numero_serie || !numero_serie.trim()) {
      return NextResponse.json({
        success: false,
        message: 'El número de serie es requerido'
      }, { status: 400 });
    }

    // Verificar si ya existe un equipo con ese número de serie
    const existingQuery = `SELECT equipo_id FROM equipos WHERE numero_serie = $1`;
    const existing = await pool.query(existingQuery, [numero_serie.trim()]);
    
    if (existing.rows.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Ya existe un equipo con ese número de serie'
      }, { status: 400 });
    }

    // Insertar nuevo equipo
    const insertQuery = `
      INSERT INTO equipos (tipo_equipo_id, numero_serie, estado)
      VALUES ($1, $2, $3)
      RETURNING equipo_id
    `;

    const result = await pool.query(insertQuery, [
      tipo_equipo_id,
      numero_serie.trim(),
      estado || 'Disponible'
    ]);

    const newEquipoId = result.rows[0].equipo_id;

    // Obtener el equipo creado con todos sus datos
    const getQuery = `
      SELECT 
        e.equipo_id,
        e.numero_serie,
        e.estado,
        te.tipo_equipo_id,
        te.nombre as tipo_equipo_nombre,
        te.descripcion
      FROM equipos e
      INNER JOIN tipo_equipo te ON e.tipo_equipo_id = te.tipo_equipo_id
      WHERE e.equipo_id = $1
    `;

    const equipoResult = await pool.query(getQuery, [newEquipoId]);
    
    return NextResponse.json({
      success: true,
      message: 'Equipo creado exitosamente',
      data: equipoResult.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Error creando equipo:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}
