import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { requirePermission, createAuthzErrorResponse } from '@/lib/middleware/auth'

export async function GET(request: NextRequest) {
  try {
    // Verificar permisos básicos (cualquier usuario autenticado puede ver sucursales)
    const { authorized, error } = requirePermission('dashboard.ver')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }
    const query = `
      SELECT 
        sucursal_id,
        nombre,
        direccion,
        telefono,
        email
      FROM sucursales
      ORDER BY nombre
    `

    const result = await pool.query(query)
    
    return NextResponse.json({
      success: true,
      data: result.rows
    })

  } catch (error) {
    console.error('Error en API de sucursales:', error)
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 })
  }
}
