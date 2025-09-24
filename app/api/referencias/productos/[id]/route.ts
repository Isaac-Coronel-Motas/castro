import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { 
  requirePermission, 
  createAuthzErrorResponse 
} from '@/lib/middleware/auth';
import { 
  validateProductoData, 
  sanitizeForLog 
} from '@/lib/utils/referencias';
import { 
  UpdateProductoRequest, 
  ReferenciasApiResponse 
} from '@/lib/types/referencias';

// GET /api/referencias/productos/[id] - Obtener producto por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productoId = parseInt(params.id);

    if (isNaN(productoId)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'ID de producto inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('referencias.leer')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Obtener producto
    const productoQuery = `
      SELECT 
        p.producto_id,
        p.nombre_producto,
        p.descripcion_producto,
        p.precio_unitario,
        p.stock,
        p.categoria_id,
        p.impuesto_id,
        p.precio_costo,
        p.precio_venta,
        p.stock_minimo,
        p.stock_maximo,
        p.marca_id,
        p.unidad_id,
        p.cod_product,
        p.estado,
        c.nombre_categoria as categoria_nombre,
        m.descripcion as marca_nombre,
        u.nombre as unidad_nombre,
        u.abreviatura as unidad_abreviatura,
        i.nombre as impuesto_nombre,
        i.porcentaje as impuesto_porcentaje
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      LEFT JOIN marcas m ON p.marca_id = m.marca_id
      LEFT JOIN unidades_medida u ON p.unidad_id = u.unidad_id
      LEFT JOIN impuestos i ON p.impuesto_id = i.impuesto_id
      WHERE p.producto_id = $1
    `;

    const productoResult = await pool.query(productoQuery, [productoId]);
    
    if (productoResult.rows.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Producto no encontrado',
        error: 'Producto no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Producto obtenido exitosamente',
      data: productoResult.rows[0]
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al obtener producto:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT /api/referencias/productos/[id] - Actualizar producto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productoId = parseInt(params.id);

    if (isNaN(productoId)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'ID de producto inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('referencias.actualizar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    const body: UpdateProductoRequest = await request.json();

    // Validar datos si se proporcionan
    if (Object.keys(body).length > 0) {
      const validation = validateProductoData(body as any);
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

    // Verificar que el producto existe
    const existingProductoQuery = 'SELECT producto_id, cod_product FROM productos WHERE producto_id = $1';
    const existingProducto = await pool.query(existingProductoQuery, [productoId]);
    
    if (existingProducto.rows.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Producto no encontrado',
        error: 'Producto no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar que el código de producto no esté en uso por otro producto
    if (body.cod_product) {
      const duplicateCodQuery = `
        SELECT producto_id FROM productos 
        WHERE producto_id != $1 AND cod_product = $2
      `;
      const duplicateCodResult = await pool.query(duplicateCodQuery, [productoId, body.cod_product]);
      
      if (duplicateCodResult.rows.length > 0) {
        const response: ReferenciasApiResponse = {
          success: false,
          message: 'Ya existe otro producto con ese código',
          error: 'Código duplicado'
        };
        return NextResponse.json(response, { status: 409 });
      }
    }

    // Verificar que la categoría existe si se proporciona
    if (body.categoria_id) {
      const categoriaQuery = 'SELECT categoria_id FROM categorias WHERE categoria_id = $1 AND estado = true';
      const categoriaResult = await pool.query(categoriaQuery, [body.categoria_id]);
      
      if (categoriaResult.rows.length === 0) {
        const response: ReferenciasApiResponse = {
          success: false,
          message: 'La categoría especificada no existe o está inactiva',
          error: 'Categoría inválida'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que la marca existe si se proporciona
    if (body.marca_id) {
      const marcaQuery = 'SELECT marca_id FROM marcas WHERE marca_id = $1';
      const marcaResult = await pool.query(marcaQuery, [body.marca_id]);
      
      if (marcaResult.rows.length === 0) {
        const response: ReferenciasApiResponse = {
          success: false,
          message: 'La marca especificada no existe',
          error: 'Marca inválida'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que la unidad existe si se proporciona
    if (body.unidad_id) {
      const unidadQuery = 'SELECT unidad_id FROM unidades_medida WHERE unidad_id = $1';
      const unidadResult = await pool.query(unidadQuery, [body.unidad_id]);
      
      if (unidadResult.rows.length === 0) {
        const response: ReferenciasApiResponse = {
          success: false,
          message: 'La unidad de medida especificada no existe',
          error: 'Unidad inválida'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Verificar que el impuesto existe si se proporciona
    if (body.impuesto_id) {
      const impuestoQuery = 'SELECT impuesto_id FROM impuestos WHERE impuesto_id = $1 AND activo = true';
      const impuestoResult = await pool.query(impuestoQuery, [body.impuesto_id]);
      
      if (impuestoResult.rows.length === 0) {
        const response: ReferenciasApiResponse = {
          success: false,
          message: 'El impuesto especificado no existe o está inactivo',
          error: 'Impuesto inválido'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // Construir query de actualización
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 0;

    if (body.nombre_producto !== undefined) {
      paramCount++;
      updateFields.push(`nombre_producto = $${paramCount}`);
      updateValues.push(body.nombre_producto);
    }

    if (body.descripcion_producto !== undefined) {
      paramCount++;
      updateFields.push(`descripcion_producto = $${paramCount}`);
      updateValues.push(body.descripcion_producto);
    }

    if (body.precio_unitario !== undefined) {
      paramCount++;
      updateFields.push(`precio_unitario = $${paramCount}`);
      updateValues.push(body.precio_unitario);
    }

    if (body.stock !== undefined) {
      paramCount++;
      updateFields.push(`stock = $${paramCount}`);
      updateValues.push(body.stock);
    }

    if (body.categoria_id !== undefined) {
      paramCount++;
      updateFields.push(`categoria_id = $${paramCount}`);
      updateValues.push(body.categoria_id);
    }

    if (body.impuesto_id !== undefined) {
      paramCount++;
      updateFields.push(`impuesto_id = $${paramCount}`);
      updateValues.push(body.impuesto_id);
    }

    if (body.precio_costo !== undefined) {
      paramCount++;
      updateFields.push(`precio_costo = $${paramCount}`);
      updateValues.push(body.precio_costo);
    }

    if (body.precio_venta !== undefined) {
      paramCount++;
      updateFields.push(`precio_venta = $${paramCount}`);
      updateValues.push(body.precio_venta);
    }

    if (body.stock_minimo !== undefined) {
      paramCount++;
      updateFields.push(`stock_minimo = $${paramCount}`);
      updateValues.push(body.stock_minimo);
    }

    if (body.stock_maximo !== undefined) {
      paramCount++;
      updateFields.push(`stock_maximo = $${paramCount}`);
      updateValues.push(body.stock_maximo);
    }

    if (body.marca_id !== undefined) {
      paramCount++;
      updateFields.push(`marca_id = $${paramCount}`);
      updateValues.push(body.marca_id);
    }

    if (body.unidad_id !== undefined) {
      paramCount++;
      updateFields.push(`unidad_id = $${paramCount}`);
      updateValues.push(body.unidad_id);
    }

    if (body.cod_product !== undefined) {
      paramCount++;
      updateFields.push(`cod_product = $${paramCount}`);
      updateValues.push(body.cod_product);
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

    // Actualizar producto
    paramCount++;
    updateValues.push(productoId);

    const updateQuery = `
      UPDATE productos 
      SET ${updateFields.join(', ')}
      WHERE producto_id = $${paramCount}
    `;

    await pool.query(updateQuery, updateValues);

    // Obtener producto actualizado
    const getProductoQuery = `
      SELECT 
        p.producto_id,
        p.nombre_producto,
        p.descripcion_producto,
        p.precio_unitario,
        p.stock,
        p.categoria_id,
        p.impuesto_id,
        p.precio_costo,
        p.precio_venta,
        p.stock_minimo,
        p.stock_maximo,
        p.marca_id,
        p.unidad_id,
        p.cod_product,
        p.estado,
        c.nombre_categoria as categoria_nombre,
        m.descripcion as marca_nombre,
        u.nombre as unidad_nombre,
        u.abreviatura as unidad_abreviatura,
        i.nombre as impuesto_nombre,
        i.porcentaje as impuesto_porcentaje
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      LEFT JOIN marcas m ON p.marca_id = m.marca_id
      LEFT JOIN unidades_medida u ON p.unidad_id = u.unidad_id
      LEFT JOIN impuestos i ON p.impuesto_id = i.impuesto_id
      WHERE p.producto_id = $1
    `;

    const productoData = await pool.query(getProductoQuery, [productoId]);

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Producto actualizado exitosamente',
      data: productoData.rows[0]
    };

    // Log de auditoría
    console.log('Producto actualizado:', sanitizeForLog({
      producto_id: productoId,
      cambios: body,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE /api/referencias/productos/[id] - Eliminar producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productoId = parseInt(params.id);

    if (isNaN(productoId)) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'ID de producto inválido',
        error: 'ID inválido'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verificar permisos
    const { authorized, error } = requirePermission('referencias.eliminar')(request);
    
    if (!authorized) {
      return createAuthzErrorResponse(error || 'No autorizado');
    }

    // Verificar que el producto existe
    const existingProductoQuery = 'SELECT producto_id, nombre_producto FROM productos WHERE producto_id = $1';
    const existingProducto = await pool.query(existingProductoQuery, [productoId]);
    
    if (existingProducto.rows.length === 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: 'Producto no encontrado',
        error: 'Producto no encontrado'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Verificar si hay ventas asociadas al producto
    const ventasQuery = `
      SELECT COUNT(*) as count FROM ventas_detalle 
      WHERE producto_id = $1
    `;
    const ventasResult = await pool.query(ventasQuery, [productoId]);
    const ventasCount = parseInt(ventasResult.rows[0].count);

    if (ventasCount > 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: `No se puede eliminar el producto porque tiene ${ventasCount} venta(s) asociada(s)`,
        error: 'Producto en uso'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Verificar si hay compras asociadas al producto
    const comprasQuery = `
      SELECT COUNT(*) as count FROM detalle_compras 
      WHERE producto_id = $1
    `;
    const comprasResult = await pool.query(comprasQuery, [productoId]);
    const comprasCount = parseInt(comprasResult.rows[0].count);

    if (comprasCount > 0) {
      const response: ReferenciasApiResponse = {
        success: false,
        message: `No se puede eliminar el producto porque tiene ${comprasCount} compra(s) asociada(s)`,
        error: 'Producto en uso'
      };
      return NextResponse.json(response, { status: 409 });
    }

    // Eliminar producto
    const deleteQuery = 'DELETE FROM productos WHERE producto_id = $1';
    await pool.query(deleteQuery, [productoId]);

    const response: ReferenciasApiResponse = {
      success: true,
      message: 'Producto eliminado exitosamente'
    };

    // Log de auditoría
    console.log('Producto eliminado:', sanitizeForLog({
      producto_id: productoId,
      nombre_producto: existingProducto.rows[0].nombre_producto,
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al eliminar producto:', error);
    
    const response: ReferenciasApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
