const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupCajaData() {
  try {
    console.log('🔧 Configurando datos básicos para caja...\n');

    // Verificar si existen sucursales
    console.log('🔍 Verificando sucursales...');
    const sucursalesQuery = 'SELECT COUNT(*) as count FROM sucursales';
    const sucursalesResult = await pool.query(sucursalesQuery);
    const sucursalesCount = parseInt(sucursalesResult.rows[0].count);

    if (sucursalesCount === 0) {
      console.log('📝 Creando sucursal principal...');
      const insertSucursalQuery = `
        INSERT INTO sucursales (nombre, direccion, telefono, activo) 
        VALUES ('Sucursal Principal', 'Dirección Principal', '0000-0000', true)
        RETURNING sucursal_id
      `;
      const sucursalResult = await pool.query(insertSucursalQuery);
      const sucursalId = sucursalResult.rows[0].sucursal_id;
      console.log(`✅ Sucursal creada con ID: ${sucursalId}`);
    } else {
      console.log(`✅ Existen ${sucursalesCount} sucursales`);
    }

    // Obtener la primera sucursal
    const getSucursalQuery = 'SELECT sucursal_id FROM sucursales WHERE activo = true LIMIT 1';
    const sucursalResult = await pool.query(getSucursalQuery);
    
    if (sucursalResult.rows.length === 0) {
      console.log('❌ No hay sucursales activas');
      return;
    }
    
    const sucursalId = sucursalResult.rows[0].sucursal_id;
    console.log(`📍 Usando sucursal ID: ${sucursalId}`);

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

    // Mostrar cajas existentes
    console.log('\n📋 Cajas disponibles:');
    const allCajasQuery = `
      SELECT c.caja_id, c.nro_caja, s.nombre as sucursal_nombre, c.activo
      FROM cajas c
      LEFT JOIN sucursales s ON c.sucursal_id = s.sucursal_id
      ORDER BY c.caja_id
    `;
    const allCajasResult = await pool.query(allCajasQuery);
    
    allCajasResult.rows.forEach(caja => {
      const estado = caja.activo ? '✅ Activa' : '❌ Inactiva';
      console.log(`ID: ${caja.caja_id} | ${caja.nro_caja} | ${caja.sucursal_nombre} | ${estado}`);
    });

    // Verificar aperturas de caja existentes
    console.log('\n🔍 Verificando aperturas de caja...');
    const aperturasQuery = 'SELECT COUNT(*) as count FROM apertura_cierre_caja';
    const aperturasResult = await pool.query(aperturasQuery);
    const aperturasCount = parseInt(aperturasResult.rows[0].count);

    console.log(`📊 Aperturas de caja existentes: ${aperturasCount}`);

    if (aperturasCount > 0) {
      console.log('\n📋 Últimas aperturas:');
      const ultimasAperturasQuery = `
        SELECT 
          acc.apertura_cierre_id,
          acc.fecha_apertura,
          acc.monto_apertura,
          acc.estado,
          c.nro_caja,
          s.nombre as sucursal_nombre
        FROM apertura_cierre_caja acc
        LEFT JOIN cajas c ON acc.caja_id = c.caja_id
        LEFT JOIN sucursales s ON c.sucursal_id = s.sucursal_id
        ORDER BY acc.fecha_apertura DESC
        LIMIT 5
      `;
      const ultimasAperturasResult = await pool.query(ultimasAperturasQuery);
      
      ultimasAperturasResult.rows.forEach(apertura => {
        console.log(`ID: ${apertura.apertura_cierre_id} | ${apertura.fecha_apertura} | ${apertura.nro_caja} | ${apertura.estado} | ₡${apertura.monto_apertura}`);
      });
    }

  } catch (error) {
    console.error('❌ Error al configurar datos de caja:', error.message);
  } finally {
    await pool.end();
  }
}

setupCajaData();
