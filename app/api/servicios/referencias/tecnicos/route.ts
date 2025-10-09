import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission, createAuthzErrorResponse } from '@/lib/middleware/auth'

// GET /api/servicios/referencias/tecnicos - Listar técnicos para servicios
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos de servicios
    const { authorized, error } = requirePermission('servicios.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const query = `
      SELECT 
        u.usuario_id as tecnico_id,
        u.nombre,
        e.puesto as especialidad,
        e.telefono,
        u.email,
        CASE WHEN u.activo = true THEN 'activo' ELSE 'inactivo' END as estado
      FROM usuarios u
      LEFT JOIN empleados e ON u.id_empleado = e.id_empleado
      WHERE u.activo = true
      ORDER BY u.nombre
    `;

    const result = await pool.query(query);
    
    return NextResponse.json({
      success: true,
      message: 'Técnicos obtenidos exitosamente',
      data: result.rows
    });

  } catch (error) {
    console.error('Error al obtener técnicos:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    }, { status: 500 });
  }
}
