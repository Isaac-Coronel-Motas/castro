import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';

// Tipos para validación
interface CreateClienteRequest {
  nombre: string;
  direccion?: string;
  ruc?: string;
  telefono?: string;
  email?: string;
  ciudad_id?: number;
}

// GET /api/referencias/clientes - Listar clientes
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    const { authorized, error } = requirePermission('leer_clientes')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Construir consulta de búsqueda
    const searchFields = ['c.nombre', 'c.telefono', 'c.ruc', 'c.email'];
    const additionalConditions: string[] = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    // Solo clientes activos
    additionalConditions.push(`c.estado = 'activo'`);

    let whereClause = '';
    if (search) {
      const searchConditions = searchFields.map(field => 
        `${field} ILIKE $${++paramCount}`
      ).join(' OR ');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      whereClause = `WHERE (${searchConditions}) AND ${additionalConditions.join(' AND ')}`;
    } else {
      whereClause = `WHERE ${additionalConditions.join(' AND ')}`;
    }

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
        ci.nombre as ciudad_nombre
      FROM clientes c
      LEFT JOIN ciudades ci ON c.ciudad_id = ci.id
      ${whereClause}
      ORDER BY c.nombre
      LIMIT $${paramCount + 1}
    `;

    const allParams = [...queryParams, limit];
    const result = await pool.query(query, allParams);
    const clientes = result.rows;

    const response = {
      success: true,
      message: 'Clientes obtenidos exitosamente',
      data: clientes
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener clientes:', error);
    
    const response = {
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
    const { authorized, error } = requirePermission('referencias.crear')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: CreateClienteRequest = await request.json();

    // Validar datos requeridos
    if (!body.nombre || body.nombre.trim() === '') {
      return NextResponse.json({
        success: false,
        message: 'El nombre del cliente es requerido',
        error: 'Nombre requerido'
      }, { status: 400 });
    }

    // Verificar si ya existe un cliente con el mismo RUC (si se proporciona)
    if (body.ruc && body.ruc.trim() !== '') {
      const existingQuery = `
        SELECT cliente_id FROM clientes 
        WHERE ruc = $1 AND estado = 'activo'
      `;
      const existingResult = await pool.query(existingQuery, [body.ruc.trim()]);

      if (existingResult.rows.length > 0) {
        return NextResponse.json({
          success: false,
          message: 'Ya existe un cliente activo con este RUC',
          error: 'RUC duplicado'
        }, { status: 400 });
      }
    }

    // Insertar nuevo cliente
    const insertQuery = `
      INSERT INTO clientes (
        nombre, 
        direccion, 
        ruc, 
        telefono, 
        email, 
        ciudad_id,
        estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'activo')
      RETURNING cliente_id, nombre, direccion, ruc, telefono, email, ciudad_id, estado
    `;

    const values = [
      body.nombre.trim(),
      body.direccion?.trim() || null,
      body.ruc?.trim() || null,
      body.telefono?.trim() || null,
      body.email?.trim() || null,
      body.ciudad_id || null
    ];

    const result = await pool.query(insertQuery, values);

    return NextResponse.json({
      success: true,
      message: 'Cliente creado exitosamente',
      data: result.rows[0]
    }, { status: 201 });

  } catch (error) {
    console.error('Error creando cliente:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    }, { status: 500 });
  }
}