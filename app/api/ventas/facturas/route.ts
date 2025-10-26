import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { requirePermission } from '@/lib/middleware/auth';

// GET /api/ventas/facturas - Listar facturas de ventas
export async function GET(request: NextRequest) {
  try {
    const { authorized, error } = requirePermission('ventas.leer')(request);
    
    if (!authorized) {
      return NextResponse.json(
        { success: false, message: 'No autorizado', error },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const cliente_id = searchParams.get('cliente_id');
    const estado = searchParams.get('estado');

    const offset = (page - 1) * limit;
    
    // Construir condiciones adicionales
    let whereConditions = [];
    let queryParams: any[] = [];
    let paramCount = 0;

    // Buscar por número de factura o nombre de cliente
    if (search) {
      paramCount++;
      whereConditions.push(`
        (v.nro_factura::text ILIKE $${paramCount} OR c.nombre ILIKE $${paramCount})
      `);
      queryParams.push(`%${search}%`);
    }

    if (cliente_id) {
      paramCount++;
      whereConditions.push(`v.cliente_id = $${paramCount}`);
      queryParams.push(parseInt(cliente_id));
    }

    if (estado) {
      paramCount++;
      whereConditions.push(`v.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Consulta para obtener el total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.cliente_id
      ${whereClause}
    `;
    
    const countParams = [...queryParams];
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Consulta principal
    const query = `
      SELECT 
        v.venta_id,
        v.nro_factura,
        v.fecha_venta,
        v.monto_venta,
        v.cliente_id,
        c.nombre as cliente_nombre,
        c.telefono as cliente_telefono,
        v.estado,
        COUNT(*) OVER() as total_count
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.cliente_id
      ${whereClause}
      ORDER BY v.fecha_venta DESC, v.nro_factura DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    const limitParam = page;
    const offsetParam = offset;
    const allParams = [...queryParams, limitParam, offsetParam];

    const result = await pool.query(query, allParams);
    const facturas = result.rows.map(row => {
      const { total_count, ...factura } = row;
      return factura;
    });

    return NextResponse.json({
      success: true,
      message: 'Facturas obtenidas exitosamente',
      data: facturas,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error obteniendo facturas de ventas:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
        error: 'Error obteniendo facturas de ventas'
      },
      { status: 500 }
    );
  }
}

