const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixTipoServicioActivo() {
  try {
    console.log('🔧 Actualizando tipos de servicio para establecer campo activo...\n');

    // Verificar el estado actual
    const checkQuery = `SELECT tipo_serv_id, descripcion, activo FROM tipo_servicio ORDER BY tipo_serv_id`;
    const checkResult = await pool.query(checkQuery);
    
    console.log('📋 Estado actual de tipos de servicio:');
    checkResult.rows.forEach(tipo => {
      console.log(`ID: ${tipo.tipo_serv_id} | ${tipo.descripcion} | Activo: ${tipo.activo}`);
    });

    // Actualizar todos los tipos de servicio para que estén activos
    const updateQuery = `UPDATE tipo_servicio SET activo = true WHERE activo IS NULL OR activo = false`;
    const updateResult = await pool.query(updateQuery);
    
    console.log(`\n✅ ${updateResult.rowCount} tipos de servicio actualizados a activo`);

    // Verificar el estado después de la actualización
    const finalResult = await pool.query(checkQuery);
    
    console.log('\n📋 Estado final de tipos de servicio:');
    finalResult.rows.forEach(tipo => {
      console.log(`ID: ${tipo.tipo_serv_id} | ${tipo.descripcion} | Activo: ${tipo.activo}`);
    });

    // Verificar específicamente el tipo ID 1
    const tipo1Query = `SELECT tipo_serv_id, descripcion, activo FROM tipo_servicio WHERE tipo_serv_id = 1`;
    const tipo1Result = await pool.query(tipo1Query);
    
    if (tipo1Result.rows.length > 0) {
      const tipo1 = tipo1Result.rows[0];
      console.log(`\n🎯 Tipo ID 1: "${tipo1.descripcion}" - Activo: ${tipo1.activo}`);
      if (tipo1.activo) {
        console.log('✅ El tipo ID 1 está activo y debería funcionar para crear servicios');
      } else {
        console.log('❌ El tipo ID 1 no está activo');
      }
    } else {
      console.log('❌ Tipo ID 1 no encontrado');
    }

  } catch (error) {
    console.error('❌ Error al actualizar tipos de servicio:', error.message);
  } finally {
    await pool.end();
  }
}

fixTipoServicioActivo();
