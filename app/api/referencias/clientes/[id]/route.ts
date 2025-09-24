import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateClienteData, 
  canDeleteCliente,
  sanitizeForLog 
} from '@/lib/utils/referencias';
import { 
  UpdateClienteRequest, 
  ReferenciasApiResponse 
} from '@/lib/types/referencias';

// GET /api/referencias/clientes/[id] - Obtener cliente por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clienteId = parseInt(params.id);

    if (isNaN(clienteId)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'ID de cliente inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('referencias.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener cliente
    const clienteQuery = `
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

    const clienteResult = await pool.query(clienteQuery, [clienteId]);
    
    if (clienteResult.rows.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Cliente no encontrado',
        error: 'Cliente no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Cliente obtenido exitosamente',
      data: clienteResult.rows[0]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener cliente:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/referencias/clientes/[id] - Actualizar cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clienteId = parseInt(params.id);

    if (isNaN(clienteId)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'ID de cliente inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('referencias.actualizar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: UpdateClienteRequest = await request.json();

    // Validar datos si se proporcionan
    if (Object.keys(body).length > 0) {
      const validation = validateClienteData(body as any);
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

    // Verificar que el cliente existe
    const existingClienteQuery = 'SELECT cliente_id, ruc FROM clientes WHERE cliente_id = $1';
    const existingCliente = await pool.query(existingClienteQuery, [clienteId]);
    
    if (existingCliente.rows.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Cliente no encontrado',
        error: 'Cliente no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar que el RUC no esté en uso por otro cliente
    if (body.ruc) {
      const duplicateRUCQuery = `
        SELECT cliente_id FROM clientes 
        WHERE cliente_id != $1 AND ruc = $2
      `;
      const duplicateRUCResult = await pool.query(duplicateRUCQuery, [clienteId, body.ruc]);
      
      if (duplicateRUCResult.rows.length > 0) {
        const response: ReferenciasApiResponse = {
          success: false,
          message: 'Ya existe otro cliente con ese RUC',
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

    // Construir query de actualización
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 0;

    if (body.nombre !== undefined) {
      paramCount++;
      updateFields.push(`nombre = $${paramCount}`);
      updateValues.push(body.nombre);
    }

    if (body.direccion !== undefined) {
      paramCount++;
      updateFields.push(`direccion = $${paramCount}`);
      updateValues.push(body.direccion);
    }

    if (body.ruc !== undefined) {
      paramCount++;
      updateFields.push(`ruc = $${paramCount}`);
      updateValues.push(body.ruc);
    }

    if (body.telefono !== undefined) {
      paramCount++;
      updateFields.push(`telefono = $${paramCount}`);
      updateValues.push(body.telefono);
    }

    if (body.email !== undefined) {
      paramCount++;
      updateFields.push(`email = $${paramCount}`);
      updateValues.push(body.email);
    }

    if (body.estado !== undefined) {
      paramCount++;
      updateFields.push(`estado = $${paramCount}`);
      updateValues.push(body.estado);
    }

    if (body.ciudad_id !== undefined) {
      paramCount++;
      updateFields.push(`ciudad_id = $${paramCount}`);
      updateValues.push(body.ciudad_id);
    }

    if (body.lista_id !== undefined) {
      paramCount++;
      updateFields.push(`lista_id = $${paramCount}`);
      updateValues.push(body.lista_id);
    }

    if (updateFields.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'No hay campos para actualizar',
        error: 'Sin cambios'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Actualizar cliente
    paramCount++;
    updateValues.push(clienteId);

    const updateQuery = `
      UPDATE clientes 
      SET ${updateFields.join(', ')}
      WHERE cliente_id = $${paramCount}
    `;

    await pool.query(updateQuery, updateValues);

    // Obtener cliente actualizado
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

    const clienteData = await pool.query(getClienteQuery, [clienteId]);

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Cliente actualizado exitosamente',
      data: clienteData.rows[0]
    };

    // Log de auditoría
    console.log('Cliente actualizado:', sanitizeForLog({
      cliente_id: clienteId,
      cambios: body,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/referencias/clientes/[id] - Eliminar cliente
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clienteId = parseInt(params.id);

    if (isNaN(clienteId)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'ID de cliente inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('referencias.eliminar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que el cliente existe
    const existingClienteQuery = 'SELECT cliente_id, nombre FROM clientes WHERE cliente_id = $1';
    const existingCliente = await pool.query(existingClienteQuery, [clienteId]);
    
    if (existingCliente.rows.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Cliente no encontrado',
        error: 'Cliente no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si hay ventas asociadas al cliente
    const ventasQuery = `
      SELECT COUNT(*) as count FROM ventas 
      WHERE cliente_id = $1
    `;
    const ventasResult = await pool.query(ventasQuery, [clienteId]);
    const ventasCount = parseInt(ventasResult.rows[0].count);

    if (!canDeleteCliente(ventasCount)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: `No se puede eliminar el cliente porque tiene ${ventasCount} venta(s) asociada(s)`,
        error: 'Cliente en uso'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Eliminar cliente
    const deleteQuery = 'DELETE FROM clientes WHERE cliente_id = $1';
    await pool.query(deleteQuery, [clienteId]);

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Cliente eliminado exitosamente'
    };

    // Log de auditoría
    console.log('Cliente eliminado:', sanitizeForLog({
      cliente_id: clienteId,
      nombre: existingCliente.rows[0].nombre,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
