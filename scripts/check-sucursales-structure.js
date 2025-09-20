const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkSucursalesStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla sucursales...\n');

    // Consultar estructura de la tabla sucursales
    const structureQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'sucursales' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;

    const structureResult = await pool.query(structureQuery);
    
    console.log('📋 Estructura de la tabla "sucursales":');
    console.log('========================================');
    
    if (structureResult.rows.length === 0) {
      console.log('❌ Tabla "sucursales" no existe');
      return;
    }

    structureResult.rows.forEach(col => {
      console.log(`✅ ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Verificar datos existentes
    const dataQuery = 'SELECT COUNT(*) as count FROM sucursales';
    const dataResult = await pool.query(dataQuery);
    console.log(`\n📊 Registros en sucursales: ${dataResult.rows[0].count}`);

    if (parseInt(dataResult.rows[0].count) === 0) {
      console.log('\n📝 Creando sucursal principal...');
      
      // Crear sucursal con los campos correctos
      const insertSucursalQuery = `
        INSERT INTO sucursales (nombre, direccion, telefono) 
        VALUES ('Sucursal Principal', 'Dirección Principal', '0000-0000')
        RETURNING sucursal_id
      `;
      
      try {
        const sucursalResult = await pool.query(insertSucursalQuery);
        const sucursalId = sucursalResult.rows[0].sucursal_id;
        console.log(`✅ Sucursal creada con ID: ${sucursalId}`);
      } catch (error) {
        console.log(`❌ Error al crear sucursal: ${error.message}`);
      }
    }

    // Mostrar sucursales existentes
    console.log('\n📋 Sucursales existentes:');
    const allSucursalesQuery = 'SELECT * FROM sucursales ORDER BY sucursal_id';
    const allSucursalesResult = await pool.query(allSucursalesQuery);
    
    allSucursalesResult.rows.forEach(sucursal => {
      console.log(`ID: ${sucursal.sucursal_id} | ${sucursal.nombre} | ${sucursal.direccion || 'Sin dirección'}`);
    });

  } catch (error) {
    console.error('❌ Error al verificar sucursales:', error.message);
  } finally {
    await pool.end();
  }
}

checkSucursalesStructure();
