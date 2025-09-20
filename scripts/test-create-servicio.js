const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testCreateServicio() {
  try {
    console.log('🧪 Probando creación de servicio...\n');

    // Datos del servicio a crear (iguales a los del usuario)
    const servicioData = {
      nombre: "Reparacion Televisores",
      descripcion: "reparacion de teevisores",
      precio_base: 100,
      tipo_serv_id: 1
    };

    console.log('📋 Datos del servicio:');
    console.log(`Nombre: ${servicioData.nombre}`);
    console.log(`Descripción: ${servicioData.descripcion}`);
    console.log(`Precio base: ${servicioData.precio_base}`);
    console.log(`Tipo servicio ID: ${servicioData.tipo_serv_id}`);

    // Verificar que el tipo de servicio existe y está activo
    console.log('\n🔍 Verificando tipo de servicio...');
    const tipoQuery = 'SELECT tipo_serv_id, descripcion, activo FROM tipo_servicio WHERE tipo_serv_id = $1';
    const tipoResult = await pool.query(tipoQuery, [servicioData.tipo_serv_id]);
    
    if (tipoResult.rows.length === 0) {
      console.log('❌ Tipo de servicio no encontrado');
      return;
    }
    
    const tipo = tipoResult.rows[0];
    console.log(`✅ Tipo encontrado: "${tipo.descripcion}" - Activo: ${tipo.activo}`);
    
    if (!tipo.activo) {
      console.log('❌ Tipo de servicio no está activo');
      return;
    }

    // Crear el servicio
    console.log('\n🔧 Creando servicio...');
    const createQuery = `
      INSERT INTO servicios (nombre, descripcion, precio_base, tipo_serv_id)
      VALUES ($1, $2, $3, $4)
      RETURNING servicio_id
    `;

    const createResult = await pool.query(createQuery, [
      servicioData.nombre,
      servicioData.descripcion,
      servicioData.precio_base,
      servicioData.tipo_serv_id
    ]);

    const newServicioId = createResult.rows[0].servicio_id;
    console.log(`✅ Servicio creado con ID: ${newServicioId}`);

    // Obtener el servicio creado con información completa
    const getQuery = `
      SELECT 
        s.servicio_id,
        s.nombre,
        s.descripcion,
        s.precio_base,
        s.tipo_serv_id,
        ts.descripcion as tipo_servicio_descripcion
      FROM servicios s
      LEFT JOIN tipo_servicio ts ON s.tipo_serv_id = ts.tipo_serv_id
      WHERE s.servicio_id = $1
    `;

    const servicioResult = await pool.query(getQuery, [newServicioId]);
    const servicio = servicioResult.rows[0];

    console.log('\n📋 Servicio creado exitosamente:');
    console.log(`ID: ${servicio.servicio_id}`);
    console.log(`Nombre: ${servicio.nombre}`);
    console.log(`Descripción: ${servicio.descripcion}`);
    console.log(`Precio base: ${servicio.precio_base}`);
    console.log(`Tipo servicio: ${servicio.tipo_servicio_descripcion}`);

  } catch (error) {
    console.error('❌ Error al crear servicio:', error.message);
  } finally {
    await pool.end();
  }
}

testCreateServicio();
