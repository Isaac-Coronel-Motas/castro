import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateClienteData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  sanitizeForLog 
} from '@/lib/utils/referencias';
import { 
  CreateClienteRequest, 
  ReferenciasApiResponse, 
  ReferenciasPaginationParams 
} from '@/lib/types/referencias';

// GET /api/referencias/clientes - Listar clientes
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('clientes.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'nombre';
    const sort_order = searchParams.get('sort_order') || 'asc';
    const estado = searchParams.get('estado');

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['c.nombre', 'c.email', 'c.telefono', 'c.ruc'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (estado) {
      paramCount++;
      additionalConditions.push(`c.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'nombre');

    // Consulta principal
    const query = `
      SELECT 
        c.cliente_id,
        c.nombre,
        c.direccion,
        c.ruc,
        c.telefono,
        c.email,
        c.estado,
        c.ciudad_id,
        c.usuario_id,
        c.lista_id,
        ci.nombre as ciudad_nombre,
        u.nombre as usuario_nombre,
        lp.nombre as lista_nombre,
        COUNT(*) OVER() as total_count
      FROM clientes c
      LEFT JOIN ciudades ci ON c.ciudad_id = ci.id
      LEFT JOIN usuarios u ON c.usuario_id = u.usuario_id
      LEFT JOIN listas_precios lp ON c.lista_id = lp.lista_id
      ${whereClause}
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const allParams = [...queryParams, ...params, limitParam, offsetParam];
    const result = await pool.query(query, allParams);
    const clientes = result.rows;
    const total = clientes.length > 0 ? parseInt(clientes[0].total_count) : 0;

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Clientes obtenidos exitosamente',
      data: clientes.map(c => {
        const { total_count, ...cliente } = c;
        return cliente;
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
    console.error('Error al obtener clientes:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/referencias/clientes - Crear cliente
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('clientes.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateClienteRequest = await request.json();

    // Validar datos
    const validation = validateClienteData(body);
    if (!validation.valid) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Datos de entrada inválidos',
        error: 'Validación fallida',
        data: validation.errors
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar que el RUC no exista si se proporciona
    if (body.ruc) {
      const existingRUCQuery = 'SELECT cliente_id FROM clientes WHERE ruc = $1';
      const existingRUC = await pool.query(existingRUCQuery, [body.ruc]);
      
      if (existingRUC.rows.length > 0) {
        const response: ReferenciasApiResponse = {
          success: false,
          message: 'Ya existe un cliente con ese RUC',
          error: 'RUC duplicado'
        };
        return NextResponse.json(response, { status: 409 });
      }
    }

    // Verificar que la ciudad existe si se proporciona
    if (body.ciudad_id) {
      const ciudadQuery = 'SELECT id FROM ciudades WHERE id = $1';
      const ciudadResult = await pool.query(ciudadQuery, [body.ciudad_id]);
      
      if (ciudadResult.rows.length === 0) {
        const response: ReferenciasApiResponse = {
          success: false,
          message: 'La ciudad especificada no existe',
          error: 'Ciudad inválida'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que la lista de precios existe si se proporciona
    if (body.lista_id) {
      const listaQuery = 'SELECT lista_id FROM listas_precios WHERE lista_id = $1 AND activo = true';
      const listaResult = await pool.query(listaQuery, [body.lista_id]);
      
      if (listaResult.rows.length === 0) {
        const response: ReferenciasApiResponse = {
          success: false,
          message: 'La lista de precios especificada no existe o está inactiva',
          error: 'Lista inválida'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Crear cliente
    const createClienteQuery = `
      INSERT INTO clientes (
        nombre, direccion, ruc, telefono, email, estado, ciudad_id, lista_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING cliente_id
    `;

    const clienteResult = await pool.query(createClienteQuery, [
      body.nombre,
      body.direccion || null,
      body.ruc || null,
      body.telefono || null,
      body.email || null,
      body.estado || 'activo',
      body.ciudad_id || null,
      body.lista_id || null
    ]);

    const newClienteId = clienteResult.rows[0].cliente_id;

    // Obtener el cliente creado con información completa
    const getClienteQuery = `
      SELECT 
        c.cliente_id,
        c.nombre,
        c.direccion,
        c.ruc,
        c.telefono,
        c.email,
        c.estado,
        c.ciudad_id,
        c.usuario_id,
        c.lista_id,
        ci.nombre as ciudad_nombre,
        u.nombre as usuario_nombre,
        lp.nombre as lista_nombre
      FROM clientes c
      LEFT JOIN ciudades ci ON c.ciudad_id = ci.id
      LEFT JOIN usuarios u ON c.usuario_id = u.usuario_id
      LEFT JOIN listas_precios lp ON c.lista_id = lp.lista_id
      WHERE c.cliente_id = $1
    `;

    const clienteData = await pool.query(getClienteQuery, [newClienteId]);

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Cliente creado exitosamente',
      data: clienteData.rows[0]
    };

    // Log de auditoría
    console.log('Cliente creado:', sanitizeForLog({
      cliente_id: newClienteId,
      nombre: body.nombre,
      ruc: body.ruc,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear cliente:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
