import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateProveedorData, 
  canDeleteProveedor,
  sanitizeForLog 
} from '@/lib/utils/referencias';
import { 
  UpdateProveedorRequest, 
  ReferenciasApiResponse 
} from '@/lib/types/referencias';

// GET /api/referencias/proveedores/[id] - Obtener proveedor por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proveedorId = parseInt(params.id);

    if (isNaN(proveedorId)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'ID de proveedor inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('leer_proveedores')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener proveedor
    const proveedorQuery = `
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

    const proveedorResult = await pool.query(proveedorQuery, [proveedorId]);
    
    if (proveedorResult.rows.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Proveedor no encontrado',
        error: 'Proveedor no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Proveedor obtenido exitosamente',
      data: proveedorResult.rows[0]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/referencias/proveedores/[id] - Actualizar proveedor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proveedorId = parseInt(params.id);

    if (isNaN(proveedorId)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'ID de proveedor inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('actualizar_proveedores')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: UpdateProveedorRequest = await request.json();

    // Validar datos si se proporcionan
    if (Object.keys(body).length > 0) {
      const validation = validateProveedorData(body as any);
      if (!validation.valid) {
        const response: ReferenciasApiResponse = {
          success: false,
          message: 'Datos de entrada inválidos',
          error: 'Validación fallida',
          data: validation.errors
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que el proveedor existe
    const existingProveedorQuery = 'SELECT proveedor_id, ruc FROM proveedores WHERE proveedor_id = $1';
    const existingProveedor = await pool.query(existingProveedorQuery, [proveedorId]);
    
    if (existingProveedor.rows.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Proveedor no encontrado',
        error: 'Proveedor no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar que el RUC no esté en uso por otro proveedor
    if (body.ruc) {
      const duplicateRUCQuery = `
        SELECT proveedor_id FROM proveedores 
        WHERE proveedor_id != $1 AND ruc = $2
      `;
      const duplicateRUCResult = await pool.query(duplicateRUCQuery, [proveedorId, body.ruc]);
      
      if (duplicateRUCResult.rows.length > 0) {
        const response: ReferenciasApiResponse = {
          success: false,
          message: 'Ya existe otro proveedor con ese RUC',
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

    // Construir query de actualización
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 0;

    if (body.nombre_proveedor !== undefined) {
      paramCount++;
      updateFields.push(`nombre_proveedor = $${paramCount}`);
      updateValues.push(body.nombre_proveedor);
    }

    if (body.correo !== undefined) {
      paramCount++;
      updateFields.push(`correo = $${paramCount}`);
      updateValues.push(body.correo);
    }

    if (body.telefono !== undefined) {
      paramCount++;
      updateFields.push(`telefono = $${paramCount}`);
      updateValues.push(body.telefono);
    }

    if (body.ruc !== undefined) {
      paramCount++;
      updateFields.push(`ruc = $${paramCount}`);
      updateValues.push(body.ruc);
    }

    if (body.direccion !== undefined) {
      paramCount++;
      updateFields.push(`direccion = $${paramCount}`);
      updateValues.push(body.direccion);
    }

    if (body.ciudad_id !== undefined) {
      paramCount++;
      updateFields.push(`ciudad_id = $${paramCount}`);
      updateValues.push(body.ciudad_id);
    }

    if (updateFields.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'No hay campos para actualizar',
        error: 'Sin cambios'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Actualizar proveedor
    paramCount++;
    updateValues.push(proveedorId);

    const updateQuery = `
      UPDATE proveedores 
      SET ${updateFields.join(', ')}
      WHERE proveedor_id = $${paramCount}
    `;

    await pool.query(updateQuery, updateValues);

    // Obtener proveedor actualizado
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

    const proveedorData = await pool.query(getProveedorQuery, [proveedorId]);

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Proveedor actualizado exitosamente',
      data: proveedorData.rows[0]
    };

    // Log de auditoría
    console.log('Proveedor actualizado:', sanitizeForLog({
      proveedor_id: proveedorId,
      cambios: body,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/referencias/proveedores/[id] - Eliminar proveedor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proveedorId = parseInt(params.id);

    if (isNaN(proveedorId)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'ID de proveedor inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('eliminar_proveedores')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que el proveedor existe
    const existingProveedorQuery = 'SELECT proveedor_id, nombre_proveedor FROM proveedores WHERE proveedor_id = $1';
    const existingProveedor = await pool.query(existingProveedorQuery, [proveedorId]);
    
    if (existingProveedor.rows.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Proveedor no encontrado',
        error: 'Proveedor no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si hay compras asociadas al proveedor
    const comprasQuery = `
      SELECT COUNT(*) as count FROM compra_cabecera 
      WHERE proveedor_id = $1
    `;
    const comprasResult = await pool.query(comprasQuery, [proveedorId]);
    const comprasCount = parseInt(comprasResult.rows[0].count);

    if (!canDeleteProveedor(comprasCount)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: `No se puede eliminar el proveedor porque tiene ${comprasCount} compra(s) asociada(s)`,
        error: 'Proveedor en uso'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Eliminar proveedor
    const deleteQuery = 'DELETE FROM proveedores WHERE proveedor_id = $1';
    await pool.query(deleteQuery, [proveedorId]);

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Proveedor eliminado exitosamente'
    };

    // Log de auditoría
    console.log('Proveedor eliminado:', sanitizeForLog({
      proveedor_id: proveedorId,
      nombre_proveedor: existingProveedor.rows[0].nombre_proveedor,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
