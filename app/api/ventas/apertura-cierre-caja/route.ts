import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateAperturaCierreCajaData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  sanitizeForLog 
} from '@/lib/utils/ventas';
import { 
  CreateAperturaCierreCajaRequest, 
  VentasApiResponse, 
  FiltrosAperturaCierreCaja 
} from '@/lib/types/ventas';

// GET /api/ventas/apertura-cierre-caja - Listar aperturas/cierres de caja
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'fecha_apertura';
    const sort_order = searchParams.get('sort_order') || 'desc';
    const estado = searchParams.get('estado');
    const fecha_desde = searchParams.get('fecha_desde');
    const fecha_hasta = searchParams.get('fecha_hasta');
    const caja_id = searchParams.get('caja_id');
    const sucursal_id = searchParams.get('sucursal_id');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['c.nro_caja', 's.nombre', 'acc.observaciones'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado) {
      paramCount++;
      additionalConditions.push(`acc.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (fecha_desde) {
      paramCount++;
      additionalConditions.push(`acc.fecha_apertura >= $${paramCount}`);
      queryParams.push(fecha_desde);
    }

    if (fecha_hasta) {
      paramCount++;
      additionalConditions.push(`acc.fecha_apertura <= $${paramCount}`);
      queryParams.push(fecha_hasta);
    }

    if (caja_id) {
      paramCount++;
      additionalConditions.push(`acc.caja_id = $${paramCount}`);
      queryParams.push(parseInt(caja_id));
    }

    if (sucursal_id) {
      paramCount++;
      additionalConditions.push(`c.sucursal_id = $${paramCount}`);
      queryParams.push(parseInt(sucursal_id));
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    // Mapear sort_by a columnas válidas
    const validSortColumns: Record<string, string> = {
      'created_at': 'fecha_apertura',
      'fecha_apertura': 'fecha_apertura',
      'fecha_cierre': 'fecha_cierre',
      'monto_apertura': 'monto_apertura',
      'monto_cierre': 'monto_cierre',
      'estado': 'estado',
      'apertura_cierre_id': 'apertura_cierre_id'
    };
    
    const mappedSortBy = validSortColumns[sort_by] || 'fecha_apertura';
    const orderByClause = buildOrderByClause(mappedSortBy, sort_order as 'asc' | 'desc', 'fecha_apertura');

    // Consulta principal
    const query = `
      SELECT 
        acc.apertura_cierre_id,
        acc.caja_id,
        acc.fecha_apertura,
        acc.monto_apertura,
        acc.fecha_cierre,
        acc.hora_cierre,
        acc.monto_cierre,
        acc.estado,
        c.nro_caja as caja_nro,
        s.nombre as sucursal_nombre,
        CASE 
          WHEN acc.monto_cierre IS NOT NULL THEN 
            acc.monto_cierre - acc.monto_apertura
          ELSE NULL
        END as diferencia,
        0 as total_ventas,
        0 as total_cobros,
        0 as total_movimientos,
        CASE 
          WHEN acc.estado = 'abierta' THEN 'Abierta'
          WHEN acc.estado = 'cerrada' THEN 'Cerrada'
        END as estado_display,
        CASE 
          WHEN acc.estado = 'abierta' THEN 'Cerrar'
          WHEN acc.estado = 'cerrada' THEN 'Ver'
        END as estado_accion,
        COUNT(*) OVER() as total_count
      FROM apertura_cierre_caja acc
      LEFT JOIN cajas c ON acc.caja_id = c.caja_id
      LEFT JOIN sucursales s ON c.sucursal_id = s.sucursal_id
      ${whereClause}
      GROUP BY acc.apertura_cierre_id, acc.caja_id, acc.fecha_apertura, acc.monto_apertura, 
               acc.fecha_cierre, acc.hora_cierre, acc.monto_cierre, acc.estado, 
               c.nro_caja, s.nombre
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const aperturas = result.rows;
    const total = aperturas.length > 0 ? parseInt(aperturas[0].total_count) : 0;

    const response: VentasApiResponse = {
      success: true,
      message: 'Aperturas/cierres de caja obtenidos exitosamente',
      data: aperturas.map(a => {
        const { total_count, ...apertura } = a;
        return apertura;
      }),
      pagination: {
        page,
        limit: limitParam,
        total,
        total_pages: Math.ceil(total / limitParam)
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener aperturas/cierres de caja:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/ventas/apertura-cierre-caja - Crear apertura de caja
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateAperturaCierreCajaRequest = await request.json();

    // Validar datos
    const validation = validateAperturaCierreCajaData(body);
    if (!validation.valid) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que la caja existe
    const cajaQuery = 'SELECT caja_id, activo FROM cajas WHERE caja_id = $1';
    const cajaResult = await pool.query(cajaQuery, [body.caja_id]);
    
    if (cajaResult.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'La caja especificada no existe',
        error: 'Caja inválida'
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (!cajaResult.rows[0].activo) {
      const response: VentasApiResponse = {
        success: false,
        message: 'La caja especificada está inactiva',
        error: 'Caja inactiva'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que no hay una apertura activa para esta caja
    const aperturaActivaQuery = 'SELECT apertura_cierre_id FROM apertura_cierre_caja WHERE caja_id = $1 AND estado = $2';
    const aperturaActiva = await pool.query(aperturaActivaQuery, [body.caja_id, 'abierta']);
    
    if (aperturaActiva.rows.length > 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Ya existe una apertura activa para esta caja',
        error: 'Apertura duplicada'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Crear apertura de caja
    const createAperturaQuery = `
      INSERT INTO apertura_cierre_caja (
        caja_id, fecha_apertura, monto_apertura, estado
      ) VALUES ($1, $2, $3, $4)
      RETURNING apertura_cierre_id
    `;

    const aperturaResult = await pool.query(createAperturaQuery, [
      body.caja_id,
      body.fecha_apertura || new Date().toISOString().split('T')[0],
      body.monto_apertura,
      body.estado || 'abierta'
    ]);

    const newAperturaId = aperturaResult.rows[0].apertura_cierre_id;

    // Obtener la apertura creada con información completa
    const getAperturaQuery = `
      SELECT 
        acc.apertura_cierre_id,
        acc.caja_id,
        acc.fecha_apertura,
        acc.monto_apertura,
        acc.fecha_cierre,
        acc.hora_cierre,
        acc.monto_cierre,
        acc.estado,
        c.nro_caja as caja_nro,
        s.nombre as sucursal_nombre
      FROM apertura_cierre_caja acc
      LEFT JOIN cajas c ON acc.caja_id = c.caja_id
      LEFT JOIN sucursales s ON c.sucursal_id = s.sucursal_id
      WHERE acc.apertura_cierre_id = $1
    `;

    const aperturaData = await pool.query(getAperturaQuery, [newAperturaId]);

    const response: VentasApiResponse = {
      success: true,
      message: 'Apertura de caja creada exitosamente',
      data: aperturaData.rows[0]
    };

    // Log de auditoría
    console.log('Apertura de caja creada:', sanitizeForLog({
      apertura_cierre_id: newAperturaId,
      caja_id: body.caja_id,
      monto_apertura: body.monto_apertura,
      estado: body.estado || 'abierta',
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear apertura de caja:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/ventas/apertura-cierre-caja/[id]/cerrar - Cerrar caja
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const aperturaId = parseInt(params.id);

    if (isNaN(aperturaId)) {
      const response: VentasApiResponse = {
        success: false,
        message: 'ID de apertura inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('ventas.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body = await request.json();
    const { monto_cierre, observaciones } = body;

    // Verificar que la apertura existe
    const existingAperturaQuery = 'SELECT apertura_cierre_id, estado FROM apertura_cierre_caja WHERE apertura_cierre_id = $1';
    const existingApertura = await pool.query(existingAperturaQuery, [aperturaId]);
    
    if (existingApertura.rows.length === 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'Apertura de caja no encontrada',
        error: 'Apertura no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si la caja puede ser cerrada
    if (existingApertura.rows[0].estado !== 'abierta') {
      const response: VentasApiResponse = {
        success: false,
        message: 'Solo se pueden cerrar cajas abiertas',
        error: 'Estado inválido'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Validar monto de cierre
    if (monto_cierre === undefined || monto_cierre < 0) {
      const response: VentasApiResponse = {
        success: false,
        message: 'El monto de cierre es requerido y debe ser no negativo',
        error: 'Monto inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Cerrar caja
    const now = new Date();
    await pool.query(
      'UPDATE apertura_cierre_caja SET estado = $1, fecha_cierre = $2, hora_cierre = $3, monto_cierre = $4 WHERE apertura_cierre_id = $5',
      [
        'cerrada',
        now.toISOString().split('T')[0],
        now.toTimeString().split(' ')[0],
        monto_cierre,
        aperturaId
      ]
    );

    const response: VentasApiResponse = {
      success: true,
      message: 'Caja cerrada exitosamente'
    };

    // Log de auditoría
    console.log('Caja cerrada:', sanitizeForLog({
      apertura_cierre_id: aperturaId,
      monto_cierre,
      observaciones,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al cerrar caja:', error);
    
    const response: VentasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
