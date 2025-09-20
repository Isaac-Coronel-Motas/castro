const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkCajaTables() {
  try {
    console.log('🔍 Verificando tablas relacionadas con caja...\n');

    // Consultar todas las tablas que contengan 'caja' en el nombre
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%caja%'
      ORDER BY table_name
    `;

    const result = await pool.query(query);
    const tables = result.rows;

    console.log('📋 Tablas relacionadas con caja:');
    console.log('================================');
    
    if (tables.length === 0) {
      console.log('❌ No se encontraron tablas relacionadas con caja');
    } else {
      tables.forEach(table => {
        console.log(`✅ ${table.table_name}`);
      });
    }

    // Verificar estructura de cada tabla
    for (const table of tables) {
      console.log(`\n🔍 Estructura de la tabla "${table.table_name}":`);
      console.log('==========================================');
      
      const structureQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND table_schema = 'public'
        ORDER BY ordinal_position
      `;

      const structureResult = await pool.query(structureQuery, [table.table_name]);
      
      if (structureResult.rows.length === 0) {
        console.log('❌ No se encontraron columnas');
      } else {
        structureResult.rows.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
      }

      // Verificar datos existentes
      const dataQuery = `SELECT COUNT(*) as count FROM ${table.table_name}`;
      try {
        const dataResult = await pool.query(dataQuery);
        console.log(`  📊 Registros: ${dataResult.rows[0].count}`);
      } catch (error) {
        console.log(`  ❌ Error al contar registros: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error al verificar tablas:', error.message);
  } finally {
    await pool.end();
  }
}

checkCajaTables();
