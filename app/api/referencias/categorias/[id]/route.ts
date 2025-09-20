import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateCategoriaData, 
  canDeleteCategoria,
  sanitizeForLog 
} from '@/lib/utils/referencias';
import { 
  UpdateCategoriaRequest, 
  ReferenciasApiResponse 
} from '@/lib/types/referencias';

// GET /api/referencias/categorias/[id] - Obtener categoría por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoriaId = parseInt(params.id);

    if (isNaN(categoriaId)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'ID de categoría inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('categorias.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener categoría
    const categoriaQuery = `
      SELECT 
        c.categoria_id,
        c.nombre_categoria,
        c.estado,
        COUNT(p.producto_id) as productos_count
      FROM categorias c
      LEFT JOIN productos p ON c.categoria_id = p.categoria_id
      WHERE c.categoria_id = $1
      GROUP BY c.categoria_id, c.nombre_categoria, c.estado
    `;

    const categoriaResult = await pool.query(categoriaQuery, [categoriaId]);
    
    if (categoriaResult.rows.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Categoría no encontrada',
        error: 'Categoría no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Categoría obtenida exitosamente',
      data: categoriaResult.rows[0]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener categoría:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/referencias/categorias/[id] - Actualizar categoría
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoriaId = parseInt(params.id);

    if (isNaN(categoriaId)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'ID de categoría inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('categorias.actualizar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: UpdateCategoriaRequest = await request.json();

    // Validar datos si se proporcionan
    if (Object.keys(body).length > 0) {
      const validation = validateCategoriaData(body as any);
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

    // Verificar que la categoría existe
    const existingCategoriaQuery = 'SELECT categoria_id, nombre_categoria FROM categorias WHERE categoria_id = $1';
    const existingCategoria = await pool.query(existingCategoriaQuery, [categoriaId]);
    
    if (existingCategoria.rows.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Categoría no encontrada',
        error: 'Categoría no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar que el nombre no esté en uso por otra categoría
    if (body.nombre_categoria) {
      const duplicateQuery = `
        SELECT categoria_id FROM categorias 
        WHERE categoria_id != $1 AND nombre_categoria = $2
      `;
      const duplicateResult = await pool.query(duplicateQuery, [categoriaId, body.nombre_categoria]);
      
      if (duplicateResult.rows.length > 0) {
        const response: ReferenciasApiResponse = {
          success: false,
          message: 'Ya existe otra categoría con ese nombre',
          error: 'Categoría duplicada'
        };
        return NextResponse.json(response, { status: 409 });
      }
    }

    // Construir query de actualización
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 0;

    if (body.nombre_categoria !== undefined) {
      paramCount++;
      updateFields.push(`nombre_categoria = $${paramCount}`);
      updateValues.push(body.nombre_categoria);
    }

    if (body.estado !== undefined) {
      paramCount++;
      updateFields.push(`estado = $${paramCount}`);
      updateValues.push(body.estado);
    }

    if (updateFields.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'No hay campos para actualizar',
        error: 'Sin cambios'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Actualizar categoría
    paramCount++;
    updateValues.push(categoriaId);

    const updateQuery = `
      UPDATE categorias 
      SET ${updateFields.join(', ')}
      WHERE categoria_id = $${paramCount}
    `;

    await pool.query(updateQuery, updateValues);

    // Obtener categoría actualizada
    const getCategoriaQuery = `
      SELECT 
        c.categoria_id,
        c.nombre_categoria,
        c.estado,
        COUNT(p.producto_id) as productos_count
      FROM categorias c
      LEFT JOIN productos p ON c.categoria_id = p.categoria_id
      WHERE c.categoria_id = $1
      GROUP BY c.categoria_id, c.nombre_categoria, c.estado
    `;

    const categoriaData = await pool.query(getCategoriaQuery, [categoriaId]);

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: categoriaData.rows[0]
    };

    // Log de auditoría
    console.log('Categoría actualizada:', sanitizeForLog({
      categoria_id: categoriaId,
      cambios: body,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/referencias/categorias/[id] - Eliminar categoría
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoriaId = parseInt(params.id);

    if (isNaN(categoriaId)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'ID de categoría inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('categorias.eliminar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que la categoría existe
    const existingCategoriaQuery = 'SELECT categoria_id, nombre_categoria FROM categorias WHERE categoria_id = $1';
    const existingCategoria = await pool.query(existingCategoriaQuery, [categoriaId]);
    
    if (existingCategoria.rows.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Categoría no encontrada',
        error: 'Categoría no encontrada'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si hay productos asociados a la categoría
    const productosQuery = `
      SELECT COUNT(*) as count FROM productos 
      WHERE categoria_id = $1
    `;
    const productosResult = await pool.query(productosQuery, [categoriaId]);
    const productosCount = parseInt(productosResult.rows[0].count);

    if (!canDeleteCategoria(productosCount)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: `No se puede eliminar la categoría porque tiene ${productosCount} producto(s) asociado(s)`,
        error: 'Categoría en uso'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Eliminar categoría
    const deleteQuery = 'DELETE FROM categorias WHERE categoria_id = $1';
    await pool.query(deleteQuery, [categoriaId]);

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Categoría eliminada exitosamente'
    };

    // Log de auditoría
    console.log('Categoría eliminada:', sanitizeForLog({
      categoria_id: categoriaId,
      nombre_categoria: existingCategoria.rows[0].nombre_categoria,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
