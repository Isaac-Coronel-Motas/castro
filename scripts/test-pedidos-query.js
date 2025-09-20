const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testPedidosQuery() {
  try {
    console.log('🧪 Probando consulta de pedidos de clientes...\n');

    // Parámetros de prueba
    const page = 1;
    const limit = 10;
    const search = '';
    const sort_by = 'created_at';
    const sort_order = 'desc';
    const estado = '';
    const cliente_id = '';

    const limitParam = Math.min(limit, 100);
    const offsetParam = (page - 1) * limitParam;

    // Campos de búsqueda
    const searchFields = [
      'c.nombre',
      'v.nro_factura::text',
      'v.tipo_documento'
    ];

    // Condiciones adicionales
    const additionalConditions = [];
    const queryParams = [];

    // Construir whereClause manualmente para prueba
    let whereClause = '';
    let params = [];

    // Mapear sort_by
    const validSortColumns = {
      'created_at': 'fecha_venta',
      'fecha_venta': 'fecha_venta',
      'fecha_pedido': 'fecha_venta',
      'monto_venta': 'monto_venta',
      'estado': 'estado',
      'cliente_nombre': 'c.nombre',
      'venta_id': 'venta_id'
    };
    
    const mappedSortBy = validSortColumns[sort_by] || 'fecha_venta';
    const orderByClause = `ORDER BY ${mappedSortBy} ${sort_order}`;

    // Construir consulta
    const query = `
      SELECT 
        v.venta_id,
        v.cliente_id,
        v.fecha_venta,
        v.estado,
        v.tipo_documento,
        v.monto_venta,
        v.caja_id,
        v.tipo_doc_id,
        v.nro_factura,
        v.forma_cobro_id,
        v.monto_gravada_5,
        v.monto_gravada_10,
        v.monto_exenta,
        v.monto_iva,
        v.condicion_pago,
        c.nombre as cliente_nombre,
        c.direccion as cliente_direccion,
        c.ruc as cliente_ruc,
        c.telefono as cliente_telefono,
        c.email as cliente_email,
        CASE 
          WHEN v.estado = 'abierto' THEN 'Abierto'
          WHEN v.estado = 'cerrado' THEN 'Cerrado'
          WHEN v.estado = 'cancelado' THEN 'Cancelado'
          ELSE v.estado::text
        END as estado_display,
        CASE 
          WHEN v.estado = 'abierto' THEN 'Editar'
          WHEN v.estado = 'cerrado' THEN 'Ver'
          WHEN v.estado = 'cancelado' THEN 'Ver'
          ELSE 'Ver'
        END as estado_accion,
        COUNT(vd.detalle_venta_id) as total_productos,
        COUNT(*) OVER() as total_count
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.cliente_id
      LEFT JOIN ventas_detalle vd ON v.venta_id = vd.venta_id
      ${whereClause}
      GROUP BY v.venta_id, v.cliente_id, v.fecha_venta, v.estado, v.tipo_documento, 
               v.monto_venta, v.caja_id, v.tipo_doc_id, v.nro_factura, v.forma_cobro_id,
               v.monto_gravada_5, v.monto_gravada_10, v.monto_exenta, v.monto_iva, 
               v.condicion_pago, c.nombre, c.direccion, c.ruc, c.telefono, c.email
      ${orderByClause}
      LIMIT $1 OFFSET $2
    `;

    const allParams = [limitParam, offsetParam];

    console.log('🔍 Consulta SQL:');
    console.log(query);
    console.log('\n📊 Parámetros:', allParams);

    const result = await pool.query(query, allParams);
    const pedidos = result.rows;
    const total = pedidos.length > 0 ? parseInt(pedidos[0].total_count) : 0;

    console.log('\n✅ Consulta exitosa');
    console.log(`📈 Total de registros: ${total}`);
    console.log(`📊 Registros obtenidos: ${pedidos.length}`);
    
    if (pedidos.length > 0) {
      console.log('\n📝 Primeros registros:');
      pedidos.slice(0, 3).forEach((pedido, index) => {
        console.log(`${index + 1}. ID: ${pedido.venta_id} | Cliente: ${pedido.cliente_nombre} | Estado: ${pedido.estado_display} | Monto: ${pedido.monto_venta}`);
      });
    }

  } catch (error) {
    console.error('❌ Error en la consulta:', error.message);
    console.error('📋 Detalles del error:', error);
  } finally {
    await pool.end();
  }
}

testPedidosQuery();
