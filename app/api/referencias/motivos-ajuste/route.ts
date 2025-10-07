import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { requirePermission, createAuthzErrorResponse } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const { authorized, error } = requirePermission('compras.leer')(request);
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const query = `
      SELECT 
        motivo_id,
        descripcion
      FROM motivo_ajuste
      ORDER BY descripcion ASC
    `;
    const result = await pool.query(query);

    return NextResponse.json({
      success: true,
      message: 'Motivos de ajuste obtenidos exitosamente',
      data: result.rows,
    });

  } catch (error) {
    console.error('Error al obtener motivos de ajuste:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno',
    }, { status: 500 });
  }
}
