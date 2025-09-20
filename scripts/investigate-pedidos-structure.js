const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function investigatePedidosStructure() {
  try {
    console.log('🔍 Investigando estructura de pedidos de clientes...\n');

    // Buscar tablas relacionadas con pedidos
    console.log('📋 Buscando tablas relacionadas con pedidos...');
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (
        table_name LIKE '%pedido%' OR 
        table_name LIKE '%orden%' OR 
        table_name LIKE '%solicitud%' OR
        table_name LIKE '%venta%' OR
        table_name LIKE '%cliente%'
      )
      ORDER BY table_name
    `;

    const tablesResult = await pool.query(tablesQuery);
    console.log('Tablas encontradas:');
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });

    // Investigar cada tabla relevante
    const relevantTables = [
      'pedidos',
      'pedido_detalle', 
      'ordenes_venta',
      'orden_venta_detalle',
      'solicitudes',
      'solicitud_detalle',
      'ventas',
      'venta_detalle',
      'clientes'
    ];

    for (const tableName of relevantTables) {
      if (tablesResult.rows.some(row => row.table_name === tableName)) {
        console.log(`\n📊 Estructura de la tabla: ${tableName}`);
        console.log('='.repeat(60));
        
        const structureQuery = `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = $1
          ORDER BY ordinal_position
        `;
        
        const structureResult = await pool.query(structureQuery, [tableName]);
        
        structureResult.rows.forEach(row => {
          console.log(`${row.column_name.padEnd(25)} | ${row.data_type.padEnd(20)} | ${row.is_nullable.padEnd(3)} | ${row.column_default || 'NULL'}`);
        });
        
        // Verificar datos de ejemplo
        const dataQuery = `SELECT COUNT(*) as count FROM ${tableName}`;
        const dataResult = await pool.query(dataQuery);
        console.log(`\n📈 Total de registros: ${dataResult.rows[0].count}`);
        
        if (parseInt(dataResult.rows[0].count) > 0) {
          const sampleQuery = `SELECT * FROM ${tableName} LIMIT 1`;
          const sampleResult = await pool.query(sampleQuery);
          console.log('📝 Ejemplo de datos:');
          Object.keys(sampleResult.rows[0]).forEach(key => {
            console.log(`  ${key}: ${sampleResult.rows[0][key]}`);
          });
        }
      }
    }

    // Buscar relaciones entre tablas
    console.log('\n🔗 Buscando relaciones entre tablas...');
    const relationsQuery = `
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND (
        tc.table_name LIKE '%pedido%' OR 
        tc.table_name LIKE '%orden%' OR 
        tc.table_name LIKE '%solicitud%' OR
        tc.table_name LIKE '%venta%'
      )
      ORDER BY tc.table_name, kcu.column_name
    `;

    const relationsResult = await pool.query(relationsQuery);
    if (relationsResult.rows.length > 0) {
      console.log('Relaciones encontradas:');
      relationsResult.rows.forEach(row => {
        console.log(`${row.table_name}.${row.column_name} → ${row.foreign_table_name}.${row.foreign_column_name}`);
      });
    } else {
      console.log('No se encontraron relaciones específicas');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

investigatePedidosStructure();
