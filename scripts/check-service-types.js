const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkServiceTypes() {
  try {
    console.log('🔍 Verificando tipos de servicio en la base de datos...\n');

    // Consultar tipos de servicio
    const query = `
      SELECT 
        ts.tipo_serv_id,
        ts.descripcion,
        ts.estado,
        COUNT(s.servicio_id) as servicios_count
      FROM tipos_servicio ts
      LEFT JOIN servicios s ON ts.tipo_serv_id = s.tipo_serv_id
      GROUP BY ts.tipo_serv_id, ts.descripcion, ts.estado
      ORDER BY ts.tipo_serv_id
    `;

    const result = await pool.query(query);
    const tiposServicio = result.rows;

    console.log('📋 Tipos de Servicio encontrados:');
    console.log('=====================================');
    
    if (tiposServicio.length === 0) {
      console.log('❌ No se encontraron tipos de servicio');
    } else {
      tiposServicio.forEach(tipo => {
        const estado = tipo.estado ? '✅ Activo' : '❌ Inactivo';
        console.log(`ID: ${tipo.tipo_serv_id} | ${tipo.descripcion} | ${estado} | Servicios: ${tipo.servicios_count}`);
      });
    }

    console.log('\n🔍 Verificando si existe el tipo_serv_id = 1...');
    const tipo1 = tiposServicio.find(t => t.tipo_serv_id === 1);
    if (tipo1) {
      console.log(`✅ Tipo ID 1 encontrado: "${tipo1.descripcion}" - Estado: ${tipo1.estado ? 'Activo' : 'Inactivo'}`);
    } else {
      console.log('❌ Tipo ID 1 NO encontrado');
    }

    console.log('\n📊 Resumen:');
    console.log(`Total tipos de servicio: ${tiposServicio.length}`);
    console.log(`Tipos activos: ${tiposServicio.filter(t => t.estado).length}`);
    console.log(`Tipos inactivos: ${tiposServicio.filter(t => !t.estado).length}`);

  } catch (error) {
    console.error('❌ Error al verificar tipos de servicio:', error.message);
  } finally {
    await pool.end();
  }
}

checkServiceTypes();
