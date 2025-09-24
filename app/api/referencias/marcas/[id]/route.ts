import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateMarcaData, 
  canDeleteMarca,
  sanitizeForLog 
} from '@/lib/utils/referencias';
import { 
  UpdateMarcaRequest, 
  ReferenciasApiResponse 
} from '@/lib/types/referencias';

// GET /api/referencias/marcas/[id] - Obtener marca por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marcaId = parseInt(params.id);

    if (isNaN(marcaId)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'ID de marca inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('referencias.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener marca
    const marcaQuery = `
      SELECT 
        m.marca_id,
        m.descripcion,
        COUNT(p.producto_id) as productos_count
      FROM marcas m
      LEFT JOIN productos p ON m.marca_id = p.marca_id
      WHERE m.marca_id = $1
      GROUP BY m.marca_id, m.descripcion
    `;

    const marcaResult = await pool.query(marcaQuery, [marcaId]);
    
    if (marcaResult.rows.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Marca no encontrada',
        error: 'Marca no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Marca obtenida exitosamente',
      data: marcaResult.rows[0]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener marca:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/referencias/marcas/[id] - Actualizar marca
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marcaId = parseInt(params.id);

    if (isNaN(marcaId)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'ID de marca inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('referencias.actualizar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: UpdateMarcaRequest = await request.json();

    // Validar datos si se proporcionan
    if (Object.keys(body).length > 0) {
      const validation = validateMarcaData(body as any);
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

    // Verificar que la marca existe
    const existingMarcaQuery = 'SELECT marca_id, descripcion FROM marcas WHERE marca_id = $1';
    const existingMarca = await pool.query(existingMarcaQuery, [marcaId]);
    
    if (existingMarca.rows.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Marca no encontrada',
        error: 'Marca no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar que la descripción no esté en uso por otra marca
    if (body.descripcion) {
      const duplicateQuery = `
        SELECT marca_id FROM marcas 
        WHERE marca_id != $1 AND descripcion = $2
      `;
      const duplicateResult = await pool.query(duplicateQuery, [marcaId, body.descripcion]);
      
      if (duplicateResult.rows.length > 0) {
        const response: ReferenciasApiResponse = {
          success: false,
          message: 'Ya existe otra marca con esa descripción',
          error: 'Marca duplicada'
        };
        return NextResponse.json(response, { status: 409 });
      }
    }

    // Construir query de actualización
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 0;

    if (body.descripcion !== undefined) {
      paramCount++;
      updateFields.push(`descripcion = $${paramCount}`);
      updateValues.push(body.descripcion);
    }

    if (updateFields.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'No hay campos para actualizar',
        error: 'Sin cambios'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Actualizar marca
    paramCount++;
    updateValues.push(marcaId);

    const updateQuery = `
      UPDATE marcas 
      SET ${updateFields.join(', ')}
      WHERE marca_id = $${paramCount}
    `;

    await pool.query(updateQuery, updateValues);

    // Obtener marca actualizada
    const getMarcaQuery = `
      SELECT 
        m.marca_id,
        m.descripcion,
        COUNT(p.producto_id) as productos_count
      FROM marcas m
      LEFT JOIN productos p ON m.marca_id = p.marca_id
      WHERE m.marca_id = $1
      GROUP BY m.marca_id, m.descripcion
    `;

    const marcaData = await pool.query(getMarcaQuery, [marcaId]);

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Marca actualizada exitosamente',
      data: marcaData.rows[0]
    };

    // Log de auditoría
    console.log('Marca actualizada:', sanitizeForLog({
      marca_id: marcaId,
      cambios: body,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al actualizar marca:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/referencias/marcas/[id] - Eliminar marca
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marcaId = parseInt(params.id);

    if (isNaN(marcaId)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'ID de marca inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('referencias.eliminar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que la marca existe
    const existingMarcaQuery = 'SELECT marca_id, descripcion FROM marcas WHERE marca_id = $1';
    const existingMarca = await pool.query(existingMarcaQuery, [marcaId]);
    
    if (existingMarca.rows.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Marca no encontrada',
        error: 'Marca no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si hay productos asociados a la marca
    const productosQuery = `
      SELECT COUNT(*) as count FROM productos 
      WHERE marca_id = $1
    `;
    const productosResult = await pool.query(productosQuery, [marcaId]);
    const productosCount = parseInt(productosResult.rows[0].count);

    if (!canDeleteMarca(productosCount)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: `No se puede eliminar la marca porque tiene ${productosCount} producto(s) asociado(s)`,
        error: 'Marca en uso'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Eliminar marca
    const deleteQuery = 'DELETE FROM marcas WHERE marca_id = $1';
    await pool.query(deleteQuery, [marcaId]);

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Marca eliminada exitosamente'
    };

    // Log de auditoría
    console.log('Marca eliminada:', sanitizeForLog({
      marca_id: marcaId,
      descripcion: existingMarca.rows[0].descripcion,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al eliminar marca:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
