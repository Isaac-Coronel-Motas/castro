import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';

// GET /api/compras/facturas - Listar facturas de compras
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('compras.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const proveedor_id = searchParams.get('proveedor_id');

    // Construir condiciones WHERE
    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      conditions.push(`(cc.nro_factura ILIKE $${paramCount} OR cc.timbrado ILIKE $${paramCount} OR pr.nombre_proveedor ILIKE $${paramCount})`);
      params.push(`%${search}%`);
    }

    if (proveedor_id) {
      paramCount++;
      conditions.push(`cc.proveedor_id = $${paramCount}`);
      params.push(parseInt(proveedor_id));
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // Consulta principal
    const query = `
      SELECT DISTINCT
        cc.compra_id,
        cc.nro_factura,
        cc.timbrado,
        cc.fecha_compra,
        cc.monto_compra,
        cc.proveedor_id,
        pr.nombre_proveedor as proveedor_nombre,
        cc.estado
      FROM compra_cabecera cc
      LEFT JOIN proveedores pr ON cc.proveedor_id = pr.proveedor_id
      ${whereClause}
      AND cc.nro_factura IS NOT NULL
      ORDER BY cc.fecha_compra DESC, cc.nro_factura DESC
      LIMIT 100
    `;

    console.log('🔍 Query:', query);
    console.log('📊 Params:', params);

    const result = await pool.query(query, params);
    const facturas = result.rows;

    console.log('✅ Facturas encontradas:', facturas.length);

    return NextResponse.json({
      success: true,
      message: 'Facturas obtenidas exitosamente',
      data: facturas
    });

  } catch (error) {
    console.error('❌ Error obteniendo facturas:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al obtener facturas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

