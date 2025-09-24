import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateProveedorData, 
  buildSearchWhereClause,
  buildOrderByClause,
  buildPaginationParams,
  sanitizeForLog 
} from '@/lib/utils/referencias';
import { 
  CreateProveedorRequest, 
  ReferenciasApiResponse, 
  ReferenciasPaginationParams 
} from '@/lib/types/referencias';

// GET /api/referencias/proveedores - Listar proveedores
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('referencias.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sort_by = searchParams.get('sort_by') || 'nombre_proveedor';
    const sort_order = searchParams.get('sort_order') || 'asc';

    const offset = (page - 1) * limit;
    const { limitParam, offsetParam } = buildPaginationParams(page, limit, offset);

    // Construir consulta de búsqueda
    const searchFields = ['p.nombre_proveedor', 'p.correo', 'p.telefono', 'p.ruc'];
    const { whereClause, params } = buildSearchWhereClause(searchFields, search);
    const orderByClause = buildOrderByClause(sort_by, sort_order as 'asc' | 'desc', 'nombre_proveedor');

    // Consulta principal
    const query = `
      SELECT 
        p.proveedor_id,
        p.nombre_proveedor,
        p.correo,
        p.telefono,
        p.ruc,
        p.direccion,
        p.ciudad_id,
        p.usuario_id,
        c.nombre as ciudad_nombre,
        u.nombre as usuario_nombre,
        COUNT(*) OVER() as total_count
      FROM proveedores p
      LEFT JOIN ciudades c ON p.ciudad_id = c.id
      LEFT JOIN usuarios u ON p.usuario_id = u.usuario_id
      ${whereClause}
      ${orderByClause}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const queryParams = [...params, limitParam, offsetParam];
    const result = await pool.query(query, queryParams);
    const proveedores = result.rows;
    const total = proveedores.length > 0 ? parseInt(proveedores[0].total_count) : 0;

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Proveedores obtenidos exitosamente',
      data: proveedores.map(p => {
        const { total_count, ...proveedor } = p;
        return proveedor;
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
    console.error('Error al obtener proveedores:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// POST /api/referencias/proveedores - Crear proveedor
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('referencias.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateProveedorRequest = await request.json();

    // Validar datos
    const validation = validateProveedorData(body);
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
      const existingRUCQuery = 'SELECT proveedor_id FROM proveedores WHERE ruc = $1';
      const existingRUC = await pool.query(existingRUCQuery, [body.ruc]);
      
      if (existingRUC.rows.length > 0) {
        const response: ReferenciasApiResponse = {
          success: false,
          message: 'Ya existe un proveedor con ese RUC',
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

    // Crear proveedor
    const createProveedorQuery = `
      INSERT INTO proveedores (
        nombre_proveedor, correo, telefono, ruc, direccion, ciudad_id, usuario_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING proveedor_id
    `;

    const proveedorResult = await pool.query(createProveedorQuery, [
      body.nombre_proveedor,
      body.correo || null,
      body.telefono || null,
      body.ruc || null,
      body.direccion || null,
      body.ciudad_id || null,
      null // usuario_id se puede agregar después si es necesario
    ]);

    const newProveedorId = proveedorResult.rows[0].proveedor_id;

    // Obtener el proveedor creado con información completa
    const getProveedorQuery = `
      SELECT 
        p.proveedor_id,
        p.nombre_proveedor,
        p.correo,
        p.telefono,
        p.ruc,
        p.direccion,
        p.ciudad_id,
        p.usuario_id,
        c.nombre as ciudad_nombre,
        u.nombre as usuario_nombre
      FROM proveedores p
      LEFT JOIN ciudades c ON p.ciudad_id = c.id
      LEFT JOIN usuarios u ON p.usuario_id = u.usuario_id
      WHERE p.proveedor_id = $1
    `;

    const proveedorData = await pool.query(getProveedorQuery, [newProveedorId]);

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Proveedor creado exitosamente',
      data: proveedorData.rows[0]
    };

    // Log de auditoría
    console.log('Proveedor creado:', sanitizeForLog({
      proveedor_id: newProveedorId,
      nombre_proveedor: body.nombre_proveedor,
      ruc: body.ruc,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error al crear proveedor:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
