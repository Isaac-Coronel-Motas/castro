const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testFixedAPI() {
  try {
    console.log('🧪 Probando API corregida...\n');

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

    // Probar API de aperturas/cierres
    console.log('\n🔍 Probando API de aperturas/cierres...');
    const aperturasResponse = await fetch('http://localhost:3000/api/ventas/apertura-cierre-caja?page=1&limit=10&sort_by=fecha_apertura&sort_order=desc', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`Status: ${aperturasResponse.status}`);
    const aperturasData = await aperturasResponse.json();
    console.log('Respuesta:', JSON.stringify(aperturasData, null, 2));

    if (aperturasResponse.ok) {
      console.log('\n✅ API funcionando correctamente');
      console.log(`📊 Total de aperturas: ${aperturasData.data?.length || 0}`);
      
      if (aperturasData.data && aperturasData.data.length > 0) {
        aperturasData.data.forEach((apertura, index) => {
          console.log(`${index + 1}. ID: ${apertura.apertura_cierre_id} | Caja: ${apertura.caja_nro} | Estado: ${apertura.estado} | Monto: ${apertura.monto_apertura}`);
        });
      }
    } else {
      console.log('\n❌ Error en la API');
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    await pool.end();
  }
}

testFixedAPI();
