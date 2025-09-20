const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testAperturaCierreQuery() {
  try {
    console.log('🧪 Probando consulta de aperturas/cierres...\n');

    // Primero probemos una consulta simple
    console.log('🔍 Probando consulta básica...');
    const basicQuery = `
      SELECT 
        acc.apertura_cierre_id,
        acc.caja_id,
        acc.fecha_apertura,
        acc.monto_apertura,
        acc.fecha_cierre,
        acc.hora_cierre,
        acc.monto_cierre,
        acc.estado
      FROM apertura_cierre_caja acc
      ORDER BY acc.fecha_apertura DESC
      LIMIT 10
    `;

    try {
      const basicResult = await pool.query(basicQuery);
      console.log('✅ Consulta básica exitosa');
      console.log('📊 Registros encontrados:', basicResult.rows.length);
      basicResult.rows.forEach(row => {
        console.log(`ID: ${row.apertura_cierre_id} | Caja: ${row.caja_id} | Estado: ${row.estado} | Monto: ${row.monto_apertura}`);
      });
    } catch (error) {
      console.log('❌ Error en consulta básica:', error.message);
      return;
    }

    // Ahora probemos con JOINs
    console.log('\n🔍 Probando consulta con JOINs...');
    const joinQuery = `
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
      ORDER BY acc.fecha_apertura DESC
      LIMIT 10
    `;

    try {
      const joinResult = await pool.query(joinQuery);
      console.log('✅ Consulta con JOINs exitosa');
      console.log('📊 Registros encontrados:', joinResult.rows.length);
      joinResult.rows.forEach(row => {
        console.log(`ID: ${row.apertura_cierre_id} | Caja: ${row.caja_nro} | Sucursal: ${row.sucursal_nombre} | Estado: ${row.estado}`);
      });
    } catch (error) {
      console.log('❌ Error en consulta con JOINs:', error.message);
      return;
    }

    // Verificar si existen las tablas problemáticas
    console.log('\n🔍 Verificando tablas relacionadas...');
    
    const tablesToCheck = ['ventas', 'cobros', 'movimientos_caja'];
    
    for (const table of tablesToCheck) {
      try {
        const checkQuery = `SELECT COUNT(*) as count FROM ${table}`;
        const checkResult = await pool.query(checkQuery);
        console.log(`✅ Tabla ${table}: ${checkResult.rows[0].count} registros`);
      } catch (error) {
        console.log(`❌ Error al verificar tabla ${table}: ${error.message}`);
      }
    }

    // Probar la consulta completa pero sin las tablas problemáticas
    console.log('\n🔍 Probando consulta completa sin tablas problemáticas...');
    const fullQuery = `
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
      GROUP BY acc.apertura_cierre_id, acc.caja_id, acc.fecha_apertura, acc.monto_apertura, 
               acc.fecha_cierre, acc.hora_cierre, acc.monto_cierre, acc.estado, 
               c.nro_caja, s.nombre
      ORDER BY acc.fecha_apertura DESC
      LIMIT 10
    `;

    try {
      const fullResult = await pool.query(fullQuery);
      console.log('✅ Consulta completa exitosa');
      console.log('📊 Registros encontrados:', fullResult.rows.length);
      fullResult.rows.forEach(row => {
        console.log(`ID: ${row.apertura_cierre_id} | Caja: ${row.caja_nro} | Estado: ${row.estado_display}`);
      });
    } catch (error) {
      console.log('❌ Error en consulta completa:', error.message);
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await pool.end();
  }
}

testAperturaCierreQuery();
