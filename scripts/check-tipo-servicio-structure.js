const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkTipoServicioStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla "tipo_servicio"...\n');

    // Consultar estructura de la tabla
    const structureQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'tipo_servicio' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;

    const structureResult = await pool.query(structureQuery);
    
    console.log('📋 Estructura de la tabla "tipo_servicio":');
    console.log('==========================================');
    
    if (structureResult.rows.length === 0) {
      console.log('❌ Tabla "tipo_servicio" no existe');
      return;
    }

    structureResult.rows.forEach(col => {
      console.log(`✅ ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Consultar datos existentes
    console.log('\n🔍 Datos existentes en "tipo_servicio":');
    console.log('========================================');
    
    const dataQuery = `SELECT * FROM tipo_servicio ORDER BY tipo_serv_id`;
    const dataResult = await pool.query(dataQuery);
    
    if (dataResult.rows.length === 0) {
      console.log('❌ No hay datos en la tabla "tipo_servicio"');
      
      // Crear datos básicos
      console.log('\n🔧 Creando tipos de servicio básicos...');
      const insertQuery = `
        INSERT INTO tipo_servicio (descripcion) VALUES
        ('Reparación'),
        ('Mantenimiento'),
        ('Instalación'),
        ('Diagnóstico')
      `;
      
      await pool.query(insertQuery);
      console.log('✅ Tipos de servicio básicos creados');
      
      // Mostrar los datos creados
      const newDataResult = await pool.query(dataQuery);
      console.log('\n📋 Tipos de servicio creados:');
      newDataResult.rows.forEach(tipo => {
        console.log(`ID: ${tipo.tipo_serv_id} | ${tipo.descripcion}`);
      });
      
    } else {
      console.log('📋 Tipos de servicio existentes:');
      dataResult.rows.forEach(tipo => {
        console.log(`ID: ${tipo.tipo_serv_id} | ${tipo.descripcion}`);
      });
    }

  } catch (error) {
    console.error('❌ Error al verificar estructura:', error.message);
  } finally {
    await pool.end();
  }
}

checkTipoServicioStructure();
