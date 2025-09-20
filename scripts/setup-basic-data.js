const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupBasicData() {
  try {
    console.log('🔧 Configurando datos básicos del sistema...\n');

    // Verificar si existe la tabla empresas
    console.log('🔍 Verificando tabla empresas...');
    const empresasQuery = 'SELECT COUNT(*) as count FROM empresas';
    const empresasResult = await pool.query(empresasQuery);
    const empresasCount = parseInt(empresasResult.rows[0].count);

    let empresaId = null;
    if (empresasCount === 0) {
      console.log('📝 Creando empresa principal...');
      const insertEmpresaQuery = `
        INSERT INTO empresas (nombre, ruc, direccion, telefono) 
        VALUES ('Taller Castro', '12345678-9', 'Dirección Principal', '0000-0000')
        RETURNING id_empresa
      `;
      const empresaResult = await pool.query(insertEmpresaQuery);
      empresaId = empresaResult.rows[0].id_empresa;
      console.log(`✅ Empresa creada con ID: ${empresaId}`);
    } else {
      console.log(`✅ Existen ${empresasCount} empresas`);
      const getEmpresaQuery = 'SELECT id_empresa FROM empresas LIMIT 1';
      const empresaResult = await pool.query(getEmpresaQuery);
      empresaId = empresaResult.rows[0].id_empresa;
      console.log(`📍 Usando empresa ID: ${empresaId}`);
    }

    // Verificar si existen sucursales
    console.log('\n🔍 Verificando sucursales...');
    const sucursalesQuery = 'SELECT COUNT(*) as count FROM sucursales';
    const sucursalesResult = await pool.query(sucursalesQuery);
    const sucursalesCount = parseInt(sucursalesResult.rows[0].count);

    let sucursalId = null;
    if (sucursalesCount === 0) {
      console.log('📝 Creando sucursal principal...');
      const insertSucursalQuery = `
        INSERT INTO sucursales (nombre, direccion, telefono, id_empresa) 
        VALUES ('Sucursal Principal', 'Dirección Principal', '0000-0000', $1)
        RETURNING sucursal_id
      `;
      const sucursalResult = await pool.query(insertSucursalQuery, [empresaId]);
      sucursalId = sucursalResult.rows[0].sucursal_id;
      console.log(`✅ Sucursal creada con ID: ${sucursalId}`);
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
    
    const empresasFinalQuery = 'SELECT id_empresa, nombre FROM empresas';
    const empresasFinalResult = await pool.query(empresasFinalQuery);
    empresasFinalResult.rows.forEach(empresa => {
      console.log(`🏢 Empresa: ${empresa.nombre} (ID: ${empresa.id_empresa})`);
    });

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

  } catch (error) {
    console.error('❌ Error al configurar datos básicos:', error.message);
  } finally {
    await pool.end();
  }
}

setupBasicData();
