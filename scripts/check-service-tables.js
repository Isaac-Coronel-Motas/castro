const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkServiceTables() {
  try {
    console.log('🔍 Verificando tablas relacionadas con servicios...\n');

    // Consultar todas las tablas que contengan 'servicio' en el nombre
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%servicio%'
      ORDER BY table_name
    `;

    const result = await pool.query(query);
    const tables = result.rows;

    console.log('📋 Tablas relacionadas con servicios:');
    console.log('=====================================');
    
    if (tables.length === 0) {
      console.log('❌ No se encontraron tablas relacionadas con servicios');
    } else {
      tables.forEach(table => {
        console.log(`✅ ${table.table_name}`);
      });
    }

    // También verificar si existe la tabla servicios
    console.log('\n🔍 Verificando tabla "servicios"...');
    const serviciosQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'servicios' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;

    try {
      const serviciosResult = await pool.query(serviciosQuery);
      if (serviciosResult.rows.length > 0) {
        console.log('✅ Tabla "servicios" existe con las siguientes columnas:');
        serviciosResult.rows.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
      } else {
        console.log('❌ Tabla "servicios" no existe');
      }
    } catch (error) {
      console.log('❌ Tabla "servicios" no existe');
    }

  } catch (error) {
    console.error('❌ Error al verificar tablas:', error.message);
  } finally {
    await pool.end();
  }
}

checkServiceTables();
