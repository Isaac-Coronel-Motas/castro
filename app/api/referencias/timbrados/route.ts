import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';

// GET /api/referencias/timbrados - Listar timbrados
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('referencias.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const sucursal_id = searchParams.get('sucursal_id');
    const activo = searchParams.get('activo');

    // Construir condiciones WHERE
    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      conditions.push(`(t.numero ILIKE $${paramCount} OR t.punto_expedicion ILIKE $${paramCount} OR t.establecimiento ILIKE $${paramCount})`);
      params.push(`%${search}%`);
    }

    if (sucursal_id) {
      paramCount++;
      conditions.push(`t.sucursal_id = $${paramCount}`);
      params.push(parseInt(sucursal_id));
    }

    if (activo !== null && activo !== undefined) {
      paramCount++;
      conditions.push(`t.activo = $${paramCount}`);
      params.push(activo === 'true');
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // Consulta principal
    const query = `
      SELECT 
        t.timbrado_id,
        t.numero,
        t.fecha_inicio,
        t.fecha_fin,
        t.sucursal_id,
        t.punto_expedicion,
        t.establecimiento,
        t.nro_desde,
        t.nro_hasta,
        t.activo,
        s.nombre as sucursal_nombre
      FROM timbrados t
      LEFT JOIN sucursales s ON t.sucursal_id = s.sucursal_id
      ${whereClause}
      ORDER BY t.numero ASC, t.fecha_inicio DESC
    `;

    console.log('🔍 Query:', query);
    console.log('📊 Params:', params);

    const result = await pool.query(query, params);
    const timbrados = result.rows;

    console.log('✅ Timbrados encontrados:', timbrados.length);

    return NextResponse.json({
      success: true,
      message: 'Timbrados obtenidos exitosamente',
      data: timbrados
    });

  } catch (error) {
    console.error('❌ Error obteniendo timbrados:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al obtener timbrados',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

