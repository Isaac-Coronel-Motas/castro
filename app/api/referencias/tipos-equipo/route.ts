import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { requirePermission, createAuthzErrorResponse } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('servicios.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const query = `
      SELECT 
        tipo_equipo_id,
        nombre,
        descripcion,
        activo
      FROM tipo_equipo
      WHERE activo = true
      ORDER BY nombre
    `;

    const result = await pool.query(query);
    
    return NextResponse.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error obteniendo tipos de equipo:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}

