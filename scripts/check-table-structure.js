const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla apertura_cierre_caja...\n');

    // Verificar estructura de la tabla
    const structureQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'apertura_cierre_caja'
      ORDER BY ordinal_position
    `;

    const structureResult = await pool.query(structureQuery);
    
    console.log('📋 Estructura de la tabla apertura_cierre_caja:');
    console.log('='.repeat(60));
    structureResult.rows.forEach(row => {
      console.log(`${row.column_name.padEnd(20)} | ${row.data_type.padEnd(15)} | ${row.is_nullable.padEnd(3)} | ${row.column_default || 'NULL'}`);
    });
    console.log('='.repeat(60));

    // Verificar datos de ejemplo
    console.log('\n📊 Datos de ejemplo:');
    const dataQuery = `SELECT * FROM apertura_cierre_caja LIMIT 1`;
    const dataResult = await pool.query(dataQuery);
    
    if (dataResult.rows.length > 0) {
      const row = dataResult.rows[0];
      console.log('Datos de la primera fila:');
      Object.keys(row).forEach(key => {
        console.log(`${key}: ${row[key]}`);
      });
    } else {
      console.log('No hay datos en la tabla');
    }

    // Verificar qué columnas están disponibles para ordenamiento
    console.log('\n🔍 Columnas disponibles para ordenamiento:');
    const availableColumns = structureResult.rows.map(row => row.column_name);
    console.log('Columnas:', availableColumns.join(', '));

    // Sugerir columnas para ordenamiento
    const suggestedSortColumns = availableColumns.filter(col => 
      col.includes('fecha') || col.includes('date') || col.includes('created') || col.includes('updated')
    );
    
    console.log('\n💡 Columnas sugeridas para ordenamiento:');
    if (suggestedSortColumns.length > 0) {
      suggestedSortColumns.forEach(col => console.log(`- ${col}`));
    } else {
      console.log('- fecha_apertura (recomendado)');
      console.log('- apertura_cierre_id (recomendado)');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTableStructure();
