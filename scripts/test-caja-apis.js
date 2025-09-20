const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testCajaAPIs() {
  try {
    console.log('🧪 Probando APIs de caja...\n');

    // Primero necesitamos obtener un token de autenticación
    console.log('🔐 Obteniendo token de autenticación...');
    
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Error al hacer login:', loginResponse.status);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Token obtenido');

    // Probar API de cajas
    console.log('\n🔍 Probando API de cajas...');
    const cajasResponse = await fetch('http://localhost:3000/api/ventas/cajas', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`Status: ${cajasResponse.status}`);
    const cajasData = await cajasResponse.json();
    console.log('Respuesta:', JSON.stringify(cajasData, null, 2));

    // Probar API de aperturas/cierres
    console.log('\n🔍 Probando API de aperturas/cierres...');
    const aperturasResponse = await fetch('http://localhost:3000/api/ventas/apertura-cierre-caja', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`Status: ${aperturasResponse.status}`);
    const aperturasData = await aperturasResponse.json();
    console.log('Respuesta:', JSON.stringify(aperturasData, null, 2));

    // Probar crear una apertura de caja
    console.log('\n🔧 Probando creación de apertura de caja...');
    const aperturaData = {
      caja_id: 1,
      monto_apertura: 50000,
      fecha_apertura: new Date().toISOString().split('T')[0],
      estado: 'abierta'
    };

    const createResponse = await fetch('http://localhost:3000/api/ventas/apertura-cierre-caja', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(aperturaData)
    });

    console.log(`Status: ${createResponse.status}`);
    const createData = await createResponse.json();
    console.log('Respuesta:', JSON.stringify(createData, null, 2));

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    await pool.end();
  }
}

testCajaAPIs();
