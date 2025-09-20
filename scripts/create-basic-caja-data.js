const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function createBasicCajaData() {
  try {
    console.log('🔧 Creando datos básicos para caja...\n');

    // Verificar si existen sucursales
    console.log('🔍 Verificando sucursales...');
    const sucursalesQuery = 'SELECT COUNT(*) as count FROM sucursales';
    const sucursalesResult = await pool.query(sucursalesQuery);
    const sucursalesCount = parseInt(sucursalesResult.rows[0].count);

    let sucursalId = null;
    if (sucursalesCount === 0) {
      console.log('📝 Creando sucursal principal...');
      
      // Intentar crear sucursal sin id_empresa primero
      try {
        const insertSucursalQuery = `
          INSERT INTO sucursales (nombre, direccion, telefono) 
          VALUES ('Sucursal Principal', 'Dirección Principal', '0000-0000')
          RETURNING sucursal_id
        `;
        const sucursalResult = await pool.query(insertSucursalQuery);
        sucursalId = sucursalResult.rows[0].sucursal_id;
        console.log(`✅ Sucursal creada con ID: ${sucursalId}`);
      } catch (error) {
        console.log(`❌ Error al crear sucursal sin empresa: ${error.message}`);
        
        // Si falla, intentar con un id_empresa por defecto
        try {
          const insertSucursalQuery = `
            INSERT INTO sucursales (nombre, direccion, telefono, id_empresa) 
            VALUES ('Sucursal Principal', 'Dirección Principal', '0000-0000', 1)
            RETURNING sucursal_id
          `;
          const sucursalResult = await pool.query(insertSucursalQuery);
          sucursalId = sucursalResult.rows[0].sucursal_id;
          console.log(`✅ Sucursal creada con ID: ${sucursalId} (con empresa ID 1)`);
        } catch (error2) {
          console.log(`❌ Error al crear sucursal con empresa: ${error2.message}`);
          return;
        }
      }
    } else {
      console.log(`✅ Existen ${sucursalesCount} sucursales`);
      const getSucursalQuery = 'SELECT sucursal_id FROM sucursales LIMIT 1';
      const sucursalResult = await pool.query(getSucursalQuery);
      sucursalId = sucursalResult.rows[0].sucursal_id;
      console.log(`📍 Usando sucursal ID: ${sucursalId}`);
    }

    // Verificar si existen cajas
    console.log('\n🔍 Verificando cajas...');
    const cajasQuery = 'SELECT COUNT(*) as count FROM cajas';
    const cajasResult = await pool.query(cajasQuery);
    const cajasCount = parseInt(cajasResult.rows[0].count);

    if (cajasCount === 0) {
      console.log('📝 Creando caja principal...');
      const insertCajaQuery = `
        INSERT INTO cajas (nro_caja, sucursal_id, activo) 
        VALUES ('CAJA-001', $1, true)
        RETURNING caja_id
      `;
      const cajaResult = await pool.query(insertCajaQuery, [sucursalId]);
      const cajaId = cajaResult.rows[0].caja_id;
      console.log(`✅ Caja creada con ID: ${cajaId}`);
    } else {
      console.log(`✅ Existen ${cajasCount} cajas`);
    }

    // Mostrar resumen final
    console.log('\n📋 Resumen de datos creados:');
    console.log('=============================');
    
    const sucursalesFinalQuery = 'SELECT sucursal_id, nombre FROM sucursales';
    const sucursalesFinalResult = await pool.query(sucursalesFinalQuery);
    sucursalesFinalResult.rows.forEach(sucursal => {
      console.log(`🏪 Sucursal: ${sucursal.nombre} (ID: ${sucursal.sucursal_id})`);
    });

    const cajasFinalQuery = 'SELECT caja_id, nro_caja FROM cajas';
    const cajasFinalResult = await pool.query(cajasFinalQuery);
    cajasFinalResult.rows.forEach(caja => {
      console.log(`💰 Caja: ${caja.nro_caja} (ID: ${caja.caja_id})`);
    });

    console.log('\n✅ Datos básicos para caja configurados correctamente');

  } catch (error) {
    console.error('❌ Error al configurar datos básicos:', error.message);
  } finally {
    await pool.end();
  }
}

createBasicCajaData();
